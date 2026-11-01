import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { TYPEORM_ENTITIES } from './constants'

/**
 * TypeORM CLI DataSource for migration generate/run.
 * Schema authority: API entity set (shared Postgres). Nest apps keep
 * synchronize: false; SchemaBootstrap may still ensure indexes TypeORM
 * cannot express.
 */
const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
	throw new Error('DATABASE_URL is required for TypeORM CLI DataSource')
}

export default new DataSource({
	type: 'postgres',
	url: databaseUrl,
	entities: [...TYPEORM_ENTITIES],
	migrations: [`${__dirname}/migrations/*.{js,ts}`],
	synchronize: false,
})
