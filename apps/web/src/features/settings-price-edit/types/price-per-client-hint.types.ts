export type PricePerClientHintProps = {
  /** Optional className for embedding in create-client (FE9). */
  className?: string
}

export type PricePerClientHintRenderProps = {
  className?: string
  loading: boolean
  error: string
  pricePerClient: string | null
}
