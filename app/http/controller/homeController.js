const Product = require('../../models/product')
function homeController(){
    return {
       async index(req, res){

            const goodis = await Product.find()
            return res.render('home',{goodis:goodis}); 
        }
    }
}
module.exports = homeController