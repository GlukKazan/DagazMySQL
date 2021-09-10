import { HttpStatus, Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { account } from '../entity/account';
import { Account } from '../interfaces/account.interface';
import { AccountTariff } from '../interfaces/accounttariff.interface';
import { AccountUser } from '../interfaces/accountuser.interface';
import { Invoice } from '../interfaces/invoice.interface';
import { Payment } from '../interfaces/payment.interface';

@Injectable()
export class AccountService {

    constructor(
        @Inject('ACC_REPOSITORY')
        private readonly service: Repository<account>
    ) {}  

    async getAccount(user_id: number): Promise<Account> {
        try {
            const x = await this.service.query(
                `select b.id, b.tariff_id, c.name as tariff, b.balance, a.created
                 from   user_account a
                 inner  join account b on (b.id = a.account_id)
                 inner  join tariff c on (c.id = b.tariff_id)
                 where  a.user_id = ? and a.deleted is null
                 order  by a.created desc`, [user_id]);
            if (!x || x.length != 1) {
                // TODO: Create Account automatically
                return null;
            }
            let it = new Account();
            it.id = x[0].id;
            it.tariff_id = x[0].tariff_id;
            it.tariff = x[0].tariff;
            it.balance = x[0].balance;
            it.created = x[0].created;
            return it;
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

    async addAccount(x: AccountUser): Promise<Account> {
        return null;
    }

    async addUser(x: AccountUser): Promise<AccountUser> {
        return null;
    }

    async delUser(x: AccountUser): Promise<AccountUser> {
        return null;
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

    async addPayment(x: Payment): Promise<Payment> {
        return null;
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
        return null;
    }
}
