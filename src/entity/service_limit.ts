import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { limit_type } from "./limit_type";
import { tariff_service } from "./tariff_service";

@Entity()
export class service_limit {
    @PrimaryGeneratedColumn()
    id: number;

    @Index()
    @Column({ nullable: false })
    type_id: number;
    @ManyToOne(type => limit_type)
    @JoinColumn({ name: "type_id" })
    types: limit_type;

    @Index()
    @Column({ nullable: false })
    tarservice_id: number;
    @ManyToOne(type => tariff_service)
    @JoinColumn({ name: "service_id" })
    tarservices: tariff_service;

    @Column({ nullable: true  })
    min_quantity: number;

    @Column({ nullable: true  })
    max_quantity: number;
}