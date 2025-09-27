import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { WishlistItem } from './wishlist-item.entity';

@Entity('wishlists')
export class Wishlist {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @ManyToOne(() => User, user => user.wishlists)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => WishlistItem, wishlistItem => wishlistItem.wishlist)
  wishlistItems: WishlistItem[];
}