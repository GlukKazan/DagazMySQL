import { HttpStatus, Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { getRepository, Repository } from 'typeorm';
import { account } from '../entity/account';
import { billing } from '../entity/billing';
import { coupon } from '../entity/coupon';
import { payment } from '../entity/payment';
import { user_account } from '../entity/user_account';
import { Account } from '../interfaces/account.interface';
import { AccountTariff } from '../interfaces/accounttariff.interface';
import { AccountUser } from '../interfaces/accountuser.interface';
import { Invoice } from '../interfaces/invoice.interface';
import { Payment } from '../interfaces/payment.interface';
import { Period } from '../interfaces/period.interface';

@Injectable()
export class AccountService {

    constructor(
        @Inject('ACC_REPOSITORY')
        private readonly service: Repository<account>
    ) {}  

    async getDefaultTariff(): Promise<number> {
        const x = await this.service.query(
            `select a.id
             from   tariff a
             where  a.is_default = 1 and a.deleted is null
             order  by a.created desc`);
        if (!x || x.length == 0) {
            return null;
        }
        return x[0].id;
    }

    async findAccount(user_id: number): Promise<Account> {
        const x = await this.service.query(
            `select b.id, b.tariff_id, c.name as tariff, b.balance, a.created
             from   user_account a
             inner  join account b on (b.id = a.account_id)
             inner  join tariff c on (c.id = b.tariff_id)
             where  a.user_id = ? and a.deleted is null
             order  by a.created desc`, [user_id]);
        if (!x || x.length == 0) return null;
        let it = new Account();
        it.id = x[0].id;
        it.tariff_id = x[0].tariff_id;
        it.tariff = x[0].tariff;
        it.balance = x[0].balance;
        it.created = x[0].created;
        return it;
    }

    async createAccount(user_id: number): Promise<Account> {
        const a = getRepository(account);
        const x = new account();
        x.tariff_id = await this.getDefaultTariff();
        if (!x.tariff_id) return null;
        x.balance = 0;
        await a.insert(x);
        const r = getRepository(user_account);
        const y = new user_account();
        y.account_id = x.id;
        y.user_id = user_id;
        await r.insert(y);
        // TODO: Add default serices
        const z = await this.findAccount(user_id);
        return z;
    }

    async getAccount(user_id: number): Promise<Account> {
        try {
            let r = await this.findAccount(user_id);
            if (!r) {
                r = await this.createAccount(user_id);
            }
            return r;
        } catch (error) {
              console.error(error);
              throw new InternalServerErrorException({
                  status: HttpStatus.BAD_REQUEST,
                  error: error
              });
        }
    }

    async getUsers(acc_id: number): Promise<AccountUser[]> {
        try {
            const x = await this.service.query(
                `select a.account_id as id, a.user_id, b.name as user, a.created, a.deleted
                 from   user_account a
                 inner  join users b on (b.id = a.user_id)
                 where  a.account_id = ?
                 order  by a.created`, [acc_id]);
            if (!x || x.length == 0) {
                 return null;
            }
            let l: AccountUser[] = x.map(x => {
                let it = new AccountUser();
                it.id = x.id;
                it.user_id = x.user_id;
                it.user = x.user;
                it.created = x.created;
                it.deleted = x.deleted;
                return it;
            });
            return l;
        } catch (error) {
              console.error(error);
              throw new InternalServerErrorException({
                  status: HttpStatus.BAD_REQUEST,
                  error: error
              });
        }
    }

    async checkLimit(acc_id: number): Promise<boolean> {
        const x = await this.service.query(
            `select b.max_quantity
             from   account a
             inner  join account_limit b on (b.tariff_id = a.tariff_id)
             where  a.id = ?`, [acc_id]);
        if (!x || x.length == 0) return true;
        const y = await this.service.query(
            `select count(*) as quantity
             from   user_account a
             where  a.account_id = ? and a.deleted is null`, [acc_id]);
        if (!y || y.length == 0) return false;
        return y[0].quantity < x[0].max_quantity;
    }

    async findUserAccountById(id: number): Promise<AccountUser> {
        const x = await this.service.query(
            `select a.id, a.account_id, a.user_id, b.name as user, a.created
             from   user_account a
             inner  join users b on (b.id = a.user_id)
             where  a.id = ?`, [id]);
        if (!x || x.length == 0) return null;
        let it = new AccountUser();
        it.id = x[0].id;
        it.account_id = x[0].account_id;
        it.user_id = x[0].user_id;
        it.user = x[0].user;
        it.created = x[0].created;
        return it;
    }

    async addUser(user_id: number, x: AccountUser): Promise<AccountUser> {
        try {
            const u = await this.findAccount(x.user_id);
            if (u) return null;
            const a = await this.findAccount(user_id);
            if (!a) return null;
            const f = await this.checkLimit(a.id);
            if (!f) return null;
            const r = getRepository(user_account);
            const y = new user_account();
            y.account_id = a.id;
            y.user_id = x.user_id;
            await r.insert(y);
            const z = await this.findUserAccountById(y.id);
            return z;
        } catch (error) {
            console.error(error);
            throw new InternalServerErrorException({
                status: HttpStatus.BAD_REQUEST,
                error: error
            });
        }
    }

    async findUserAccountByUser(user_id: number): Promise<AccountUser> {
        const x = await this.service.query(
            `select a.id, a.account_id, a.user_id, b.name as user, a.created
             from   user_account a
             inner  join users b on (b.id = a.user_id)
             where  a.user_id = ? and a.deleted is null`, [user_id]);
        if (!x || x.length == 0) return null;
        let it = new AccountUser();
        it.id = x[0].id;
        it.account_id = x[0].account_id;
        it.user_id = x[0].user_id;
        it.user = x[0].user;
        it.created = x[0].created;
        return it;
    }

    async delUser(user_id: number, x: AccountUser): Promise<AccountUser> {
        try {
            if (user_id == x.user_id) return null;
            const r = await this.findUserAccountByUser(x.user_id);
            if (r) {
                const u = await this.findAccount(user_id);
                if (u) return null;
                if (u.id != r.account_id) return null;
                await this.service.createQueryBuilder("user_account")
                .update(user_account)
                .set({ 
                    deleted: new Date()
                 })
                .where("id = :id", {id: r.id})
                .execute();
            }
            return r;
        } catch(error) {
            console.error(error);
            throw new InternalServerErrorException({
                status: HttpStatus.BAD_REQUEST,
                error: error
            });
        }
    }

    async getPayments(acc_id: number): Promise<Payment[]> {
        try {
            const x = await this.service.query(
                `select a.id, a.account_id, b.code as coupon, a.amount, a.created
                 from   payment a
                 jeft   join coupon b on (b.payment_id = a.id)
                 where  a.account_id = ?
                 order  by a.created`, [acc_id]);
            let l: Payment[] = x.map(x => {
                let it = new Payment();
                it.id = x.id;
                it.account_id = x.account_id;
                it.coupon = x.coupon;
                it.amount = x.amount;
                it.created = x.created;
                return it;
            });
            return l;
        } catch (error) {
              console.error(error);
              throw new InternalServerErrorException({
                  status: HttpStatus.BAD_REQUEST,
                  error: error
              });
        }
    }

    async getCoupon(code: string): Promise<coupon> {
        const x = await this.service.query(
            `select a.id, a.payment_id, a.amount, a.created
             from   coupon a
             where  a.code = ? and a.payment_id is null and a.activated is null`, [code]);
        if (!x || x.length == 0) return null;
        let it = new coupon();
        it.id = x[0].id;
        it.payment_id = x[0].payment_id;
        it.amount = x[0].amount;
        it.created = x[0].created;
        return it;
    }

    async getBilling(): Promise<billing> {
        const x = await this.service.query(
            `select a.id, a.created
             from   billing a
             where  a.closed is null`);
        if (!x || x.length == 0) return null;
        let r = new billing();
        r.id = x[0].id;
        r.created = x[0].created;
        return r;
    }

    async getPeriod(): Promise<Period> {
        const x = await this.service.query(
            `select DATE_SUB(CURDATE(), INTERVAL DAYOFMONTH(CURDATE())-1 DAY) as start,
                    DATE_SUB(DATE_ADD(a.created, INTERVAL 32 DAY), INTERVAL DAYOFMONTH(DATE_ADD(a.created, INTERVAL 32 DAY))-1 DAY) as end`);
        if (!x || x.length == 0) return null;
        let r = new Period();
        r.start = x[0].start;
        r.end = x[0].end;
        return r;
    }

    async getCurrentBilling(): Promise<billing> {
        const p = await this.getPeriod();
        let x = await this.getBilling();
        if (!x || x.created != p.start) {
            if (!x) {
                await this.service.createQueryBuilder("billing")
                .update(billing)
                .set({ 
                    closed: p.end
                 })
                .where("id = :id", {id: x.id})
                .execute();
            }
            const r = getRepository(billing);
            const y = new billing();
            y.created = p.start;
            await r.insert(y);
            x = await this.getBilling();
        }
        return x;
    }

    async addCoupon(user_id: number, x: Payment): Promise<Payment> {
        try {
            const a = await this.findAccount(user_id);
            if (!a) return null;
            x.account_id = a.id;
            const c = await this.getCoupon(x.coupon);
            if (!c) return null;
            const b = await this.getCurrentBilling();
            if (!b) return null;
            const r = getRepository(payment);
            const y = new payment();
            y.account_id = x.account_id;
            y.billing_id = b.id;
            y.type_id = 2;
            y.amount = c.amount;
            await r.insert(y);
            await this.service.createQueryBuilder("coupon")
            .update(coupon)
            .set({ 
                payment_id: y.id,
                activated: new Date()
             })
            .where("id = :id", {id: c.id})
            .execute();
            await this.service.createQueryBuilder("account")
            .update(account)
            .set({ 
                balance: a.balance + c.amount
             })
            .where("id = :id", {id: x.account_id})
            .execute();
            x.amount = c.amount;
            x.created = new Date();
            return x;
        } catch (error) {
            console.error(error);
            throw new InternalServerErrorException({
                status: HttpStatus.BAD_REQUEST,
                error: error
            });
        }
    }

    async getInvoices(acc_id: number): Promise<Invoice[]> {
        try {
            const x = await this.service.query(
                `select a.id, a.account_id, a.amount, a.service_id, b.name as service, a.created, a.closed
                 from   invoice a
                 inner  join service b on (b.id = a.service_id)
                 where  a.account_id = ?
                 order  by a.created`, [acc_id]);
            let l: Invoice[] = x.map(x => {
                let it = new Invoice();
                it.id = x.id;
                it.account_id = x.account_id;
                it.amount = x.amount;
                it.service_id = x.service_id;
                it.service = x.service;
                it.created = x.created;
                it.closed = x.closed;
                return it;
            });
            return l;
        } catch (error) {
              console.error(error);
              throw new InternalServerErrorException({
                  status: HttpStatus.BAD_REQUEST,
                  error: error
              });
        }
    }

    async setTariff(x: AccountTariff): Promise<AccountTariff> {
        try {
            // TODO: Close Services
            // TODO: Change Tariff
            // TODO: Add default serices
            return null;

        } catch (error) {
              console.error(error);
              throw new InternalServerErrorException({
                  status: HttpStatus.BAD_REQUEST,
                  error: error
              });
        }
    }
}
