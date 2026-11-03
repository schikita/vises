import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1793561000000 implements MigrationInterface {
    name = 'Migration1793561000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "first_name" character varying(200)`);
        await queryRunner.query(`ALTER TABLE "users" ADD "last_name" character varying(200)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "last_name"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "first_name"`);
    }

}
