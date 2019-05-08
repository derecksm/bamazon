
// BUG REPORT

// connect NPMs
const { prompt } = require('inquirer')
const { createConnection } = require('mysql2')

// Database Connection
const db = createConnection({
    host: 'localhost',
    user: 'root',
    password: 'DlfjsQlfdjajrdmf91',
    database: 'bamazon'
})

// async function for product list
async function getList(inputWhere) {
    let response = await new Promise((resolve, reject) => {
        db.query(`SELECT ${inputWhere} FROM products`, (e, r) => {
            if (e) {
                reject(e)
            } else {
                resolve(r)
            }
        })
    })
    return response
}
// function to update the current stock
const updateStock = (itemCode, newStock) => {
    db.query(`UPDATE products SET stockQuantity = ? WHERE item_id = ?`, [newStock, itemCode], e => {
        if (e) throw e
        console.log(`
        --------------------------
        Your item is going to be shipped.
        bAmazon provides free Shipping, because they didn't specify shipping cost in their homework instruction
        --------------------------
        `)
        process.exit()
    })
}

// Function for main function
const mainFunc = () => {
    prompt([
        {
            type: 'input',
            name: 'itemCode',
            message: `
            --------------------------
            Welcome to bAmazon, where Bootcamp students are dying from stress, lack of sleep, and overloaded brain.
            --------------------------
            Above, you can see the list of items that are currenlty available in bAmazon. Which one would you like to purchase?
            Please Enter applicable Item Code.
            --------------------------
            `
        },
        {
            type: 'number',
            name: 'quantity',
            message: `
            --------------------------
            Great job! Now how many of those do you want today?
            --------------------------
            `
        }
    ])
        .then(({ itemCode, quantity }) => {
            db.query(`SELECT * FROM products WHERE item_id = ?`, itemCode, (e, [{ stockQuantity, price }]) => {
                if (e) {
                    throw e
                } else {
                    if (quantity > stockQuantity) {
                        console.log(`
                        --------------------------
                        We do not have enough stock dawg
                        --------------------------
                        `)
                        process.exit()
                    } else {
                        let diff = stockQuantity - quantity
                        let total = quantity * parseInt(price)
                        console.log(`
                        --------------------------
                        Your total is going to be $${total}
                        --------------------------
                        `)
                        updateStock(itemCode, diff)
                    }
                }

            })
        })
        .catch(e => console.log(e))
}



// Place to run main function
db.connect(e => {
    if (e) {
        throw e
    } else {
        getList('*')
            .then(r => {
                r.forEach(({ item_id, product_name, price }) => console.log(`
            ----------------
            Item Code : ${item_id}
            Product Name : ${product_name}
            Price : $${price}
            ----------------
            `))
                mainFunc()
            })
            .catch(e => console.log(e))
    }
})

