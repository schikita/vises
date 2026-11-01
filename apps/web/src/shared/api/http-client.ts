import axios, { type AxiosRequestConfig } from 'axios'
import type { ApiRawResponse, ApiRequestOptions, ApiTokenProvider } from './types'
import { buildApiUrl } from './utils/build-api-url.util'
import { createApiHttpError } from './utils/create-api-http-error.util'
import { extractApiErrorDetail } from './utils/extract-api-error-detail.util'

let tokenProvider: ApiTokenProvider = () => null

export const setApiTokenProvider = (provider: ApiTokenProvider) => {
  tokenProvider = provider
}

/**
 * JSON/FormData API call with Bearer token.
 * 204 → `undefined`. Non-2xx → `ApiHttpError` with status + Nest detail (FR-19 / AC-19c).
 * FormData: do not force JSON Content-Type (browser sets multipart boundary).
 */
export const apiRequest = async <T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> => {
  const { method = 'GET', data, headers: extraHeaders = {} } = options
  const token = tokenProvider()
  const headers: Record<string, string> = { ...extraHeaders }
  if (token) headers.Authorization = `Bearer ${token}`

  const hasContentType = Object.keys(headers).some((k) => k.toLowerCase() === 'content-type')
  const formData =
    typeof FormData !== 'undefined' && data instanceof FormData
  if (data !== undefined && data !== null && !formData && !hasContentType) {
    headers['Content-Type'] = 'application/json'
  }

  try {
    const res = await axios.request<T>({
      url: buildApiUrl(path),
      method,
      data,
      headers,
    })
    if (res.status === 204) return undefined as T
    return res.data
  } catch (err) {
    if (axios.isAxiosError(err) && err.response) {
      const detail = extractApiErrorDetail(err.response.data) ?? ''
      throw createApiHttpError(err.response.status, detail, err.response.data)
    }
    throw err
  }
}

/** Authenticated blob GET (docs / screenshots). Throws on non-2xx. */
export const fetchApiBlob = async (path: string): Promise<Blob> => {
  const token = tokenProvider()
  const headers: Record<string, string> = {}
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await axios.request<Blob>({
    url: buildApiUrl(path),
    method: 'GET',
    responseType: 'blob',
    headers,
  })
  return res.data
}

/**
 * Request that does not throw on HTTP error status (network failures set networkError).
 * Used when callers must inspect 401/403/422/502 bodies (portal autofill).
 */
export const apiRequestRaw = async <T = unknown>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<ApiRawResponse<T>> => {
  const { method = 'GET', data, headers: extraHeaders = {} } = options
  const token = tokenProvider()
  const headers: Record<string, string> = { ...extraHeaders }
  if (token) headers.Authorization = `Bearer ${token}`

  const hasContentType = Object.keys(headers).some((k) => k.toLowerCase() === 'content-type')
  const formData =
    typeof FormData !== 'undefined' && data instanceof FormData
  if (data !== undefined && data !== null && !formData && !hasContentType) {
    headers['Content-Type'] = 'application/json'
  }

  const config: AxiosRequestConfig = {
    url: buildApiUrl(path),
    method,
    data,
    headers,
    validateStatus: () => true,
  }

  try {
    const res = await axios.request<T>(config)
    return { status: res.status, data: res.data, networkError: false }
  } catch {
    return { status: 0, data: null as T, networkError: true }
  }
}
