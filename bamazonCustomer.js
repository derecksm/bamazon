require('dotenv').config()
const keys = require('./keys.js')

const { createConnection } = require('mysql2')
const { prompt } = require('inquirer')
const db = createConnection({
    host: 'localhost',
    port: 3306,
    user: keys.user,
    password: keys.password,
    database: 'bamazon_db'
})

const viewPlaylist = _ => {
    db.query('SELECT * FROM products', (e, r) => {
        if (e) throw e
        r.forEach(({ item_id, product_name, department_name, price, stock_quantity }) => console.log(`
      -------------------------------
        Item ID: ${item_id}
       Product Name: ${product_name}
       Department: ${department_name}
       Price: $${price}
       Qty Available: ${stock_quantity}
        `))

        const purchaseItem = _ => {
            prompt({
                type: 'input',
                name: 'id',
                message: 'What is the ID of the product you will like to buy?',

            })
                .then(answer1 => {
                    let selection = answer1.id
                    db.query('SELECT * FROM products WHERE item_id=?', selection, (e, r) => {
                        if (e) throw e
                        if (r.length === 0) {
                            console.log("That Product doesn't exist. Please select a valid ID type")
                        } else {
                            prompt({
                                type: 'input',
                                name: 'quantity',
                                message: 'How many would you like to purchase?'
                            })
                                .then(answer2 => {
                                    let quantity = answer2.quantity

                                    if (quantity > r[0].stock_quantity) {
                                        console.log("Not enough inventory")
                                        process.exit()

                                    }
                                    else {
                                       console.log('-------------------')
                                       console.log(`${quantity} ${r[0].product_name} were puchased at $${r[0].price * quantity}`)
                                       

                                        var newQty = r[0].stock_quantity - quantity;
                                        db.query(
                                          "UPDATE products SET stock_quantity = " +
                                            newQty + " WHERE item_id = " + r[0].item_id,(e, resUpdate) => {
                                            if (e) throw e
                                            console.log("")
                                            console.log("Thank you for your money...now buy more.")
                                            console.log("")
                                            })
                                            process.exit()
                                    }
                                })
                        }
                    })
                })
                .catch(e => console.log(e))
        }
        purchaseItem()
    })
}

db.connect(e => {
    if (e) throw e
    viewPlaylist()
})
