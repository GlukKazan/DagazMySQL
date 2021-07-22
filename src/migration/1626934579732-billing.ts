import {MigrationInterface, QueryRunner} from "typeorm";

export class billing1626934579732 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`insert into billing(closed) values(null)`);

        await queryRunner.query(`insert into scope(id, name) values(1, 'Free content')`);
        await queryRunner.query(`insert into scope(id, name) values(2, 'Tony Berard''s games')`);
        await queryRunner.query(`insert into scope(id, name) values(3, 'Valentin Chelnokov''s games')`);

        await queryRunner.query(`insert into service_type(id, name) values(1, 'event')`);
        await queryRunner.query(`insert into service_type(id, name) values(2, 'periodic')`);
        await queryRunner.query(`insert into service_type(id, name) values(3, 'time trecking')`);
        await queryRunner.query(`insert into service_type(id, name) values(4, 'subscription')`);

        await queryRunner.query(`insert into payment_type(id, name) values(1, 'promotion')`);
        await queryRunner.query(`insert into payment_type(id, name) values(2, 'coupon')`);

        await queryRunner.query(`insert into discount_type(id, name) values(1, 'promotion')`);

        await queryRunner.query(`insert into limit_type(id, name) values(1, 'number of accounts')`);
        await queryRunner.query(`insert into limit_type(id, name) values(2, 'number of connections')`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`delete from limit_type`);
        await queryRunner.query(`delete from discount_type`);
        await queryRunner.query(`delete from payment_type`);
        await queryRunner.query(`delete from service_type`);
        await queryRunner.query(`delete from scope`);
        await queryRunner.query(`delete from billing`);
    }

}
