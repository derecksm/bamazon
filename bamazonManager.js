require('dotenv').config()
const keys = require('./keys.js')

const { createConnection } = require('mysql2')
const { prompt } = require('inquirer')
require
const db = createConnection({
    host: 'localhost',
    port: 3306,
    user: keys.user,
    password: keys.password,
    database: 'bamazon_db'
})

// View all products for sale
const viewInventory = _ => {
    db.query('SELECT * FROM products', (e, r) => {
        if (e) throw e
        r.forEach(({ item_id, product_name, price, stock_quantity }) => {
            console.log(`
        -------------------
        Item ID: ${item_id}
        Name: ${product_name}
        Price: $${price}
        Qty: ${stock_quantity}
        -------------------
        `)
        })
        managerView()
    })
}
//View low inventory - will display qtys that equal 5 or below
const viewLow = _ => {
    db.query('SELECT * FROM products Where stock_quantity <= 5', (e, r) => {
        if (e) throw e
        r.forEach(({ item_id, product_name, price, stock_quantity }) => {
            console.log(`
            -------------------
            Item ID: ${item_id}
            Name: ${product_name}
            Price: $${price}
            Qty: ${stock_quantity}
            -------------------
            `)
        })
        managerView()
    })
}

//Update inventory
const addInventory = _ => {
    db.query('SELECT * FROM products', (e, r) => {
        if (e) throw e
        const productArr = r.map(({ product_name }) => product_name)
        prompt([
            {
                type: 'list',
                name: 'product_name',
                message: 'What item would you like to adjust inventory for?',
                choices: productArr
            },
            {
                type: 'input',
                name: 'stock_quantity',
                message: 'What is the new qty?',
            }
        ])
            .then(({ product_name, stock_quantity }) => {
                db.query('UPDATE products SET ? WHERE ?', [
                    {
                        stock_quantity: stock_quantity
                    },
                    {
                        product_name: product_name
                    }
                ])
                console.log(`
                ---------------------------------------------------------------
                Congrats! ${product_name} has been updated to ${stock_quantity} units
                ---------------------------------------------------------------
                    `)
                    managerView()

            })
            .catch(e => console.log(e))
    })
}
//Add new product 
const addProduct = _ => {
    prompt([
        {
            type: 'input',
            name: 'item_id',
            message: 'What is the id of the new product?'
        },
        {
            type: 'input',
            name: 'product_name',
            message: 'What is the name of the new product?'
        },
        {
            type: 'input',
            name: 'department_name',
            message: 'What is the department of the new product?'
        },
        {
            type: 'input',
            name: 'price',
            message: 'What is the price of the new product?'
        },
        {
            type: 'input',
            name: 'stock_quantity',
            message: 'What is the stock quantity of the new product?'
        },

    ])
        .then(({ item_id, product_name, department_name, price, stock_quantity }) => {
            db.query('INSERT INTO products SET ?', {
                item_id,
                product_name,
                department_name,
                price,
                stock_quantity
            }, (e, r) => {
                if (e) throw e
                console.log(`
                ---------------------------------------
                Your product was added to our catalog!
                ---------------------------------------
                `)
                managerView()
            })
        })
        .catch(e => console.log(e))
}

const managerView = _ => {
    prompt({
        type: 'list',
        name: 'start',
        message: 'What would you like to do?',
        choices: ["View All Products", "View Low Inventoy", "Add Inventory", "Add New Product", "Exit"]
    })
        .then(({ start }) => {
            switch (start) {

                case "View All Products":
                    viewInventory()
                    break

                case "View Low Inventoy":
                    viewLow()
                    break

                case "Add Inventory":
                    addInventory()
                    break

                case "Add New Product":
                    addProduct()
                    break

                case "Exit":
                    process.exit()
                    break

                default:
                    managerView()
                    break
            }
        })
        .catch(e => console.log(e))
}
db.connect(e => {
    if (e) throw e
    managerView()
})