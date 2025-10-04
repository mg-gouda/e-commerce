import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class ProductCategoriesManyToMany1759500384474 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create junction table for many-to-many relationship
        await queryRunner.createTable(
            new Table({
                name: 'product_categories',
                columns: [
                    {
                        name: 'product_id',
                        type: 'uuid',
                        isPrimary: true,
                    },
                    {
                        name: 'category_id',
                        type: 'uuid',
                        isPrimary: true,
                    },
                    {
                        name: 'created_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                    },
                ],
            }),
            true
        );

        // Add foreign key for product_id
        await queryRunner.createForeignKey(
            'product_categories',
            new TableForeignKey({
                columnNames: ['product_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'products',
                onDelete: 'CASCADE',
            })
        );

        // Add foreign key for category_id
        await queryRunner.createForeignKey(
            'product_categories',
            new TableForeignKey({
                columnNames: ['category_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'categories',
                onDelete: 'CASCADE',
            })
        );

        // Migrate existing data from products.category_id to junction table
        await queryRunner.query(`
            INSERT INTO product_categories (product_id, category_id)
            SELECT id, category_id FROM products WHERE category_id IS NOT NULL
        `);

        // Drop the old category_id column from products table
        await queryRunner.dropColumn('products', 'category_id');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Add back the category_id column to products
        await queryRunner.query(`
            ALTER TABLE products ADD COLUMN category_id uuid
        `);

        // Migrate data back (taking first category if multiple exist)
        await queryRunner.query(`
            UPDATE products p
            SET category_id = (
                SELECT category_id
                FROM product_categories pc
                WHERE pc.product_id = p.id
                LIMIT 1
            )
        `);

        // Add back foreign key
        await queryRunner.createForeignKey(
            'products',
            new TableForeignKey({
                columnNames: ['category_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'categories',
                onDelete: 'SET NULL',
            })
        );

        // Drop junction table
        await queryRunner.dropTable('product_categories');
    }

}
