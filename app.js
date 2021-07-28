
const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("Your mongo link",{useNewUrlParser:true ,useUnifiedTopology: true});

//to remove deprecated warning whwn use findoneandupdate(from stackoverflow)
mongoose.set('useFindAndModify', false);


const itemSchema = new mongoose.Schema({
  name:{
    type: String,
    required:[true,"name cannot be empty!"]
  }
});

const Item = new mongoose.model("Item",itemSchema);

let item1 = new Item({
  name:"Welcome to your to do list!"
});

let item2 = new Item({
  name:"Hit the + icon to add items to the list!"
});

let item3 = new Item({
  name:"<-- Use this icon to delete items"
});

const defaultItems = [item1,item2,item3];







app.get("/", function(req, res) {
  
  Item.find({},(error,result)=>{
    
    if(!error){
      if(result.length === 0){
        
        Item.insertMany(defaultItems,(error,result)=>{
          if(error){
           
          }else{
            console.log("succssfullt inserted default items in to DB.");
          }
        });

        res.redirect("/");

      }else{
        res.render("list", {listTitle: "Today", newListItems: result});
      }
    }

  });

});

app.post("/", function(req, res){

  const listName = req.body.list;
  const itemName = req.body.newItem;

  if(listName === "Today"){
    const item = new Item({
      name:itemName
    })
  
    item.save();
    res.redirect("/");
  }else{

    List.findOne({name:listName},(error,foundList)=>{

      if(!error){

        if(foundList){
          const item = new Item({
            name:itemName
          })
          foundList.items.push(item);
          foundList.save();
          res.redirect("/"+listName);
        }
      }

    })

  }
  

});


app.post("/delete",(req,res)=>{

  const checkedItem = req.body.checkbox;
  let listName = req.body.listName;

  if(Array.isArray(listName)){
    listName = listName[0];
  }
  console.log(listName);
  if(listName === "Today"){
    Item.findByIdAndDelete(checkedItem,(error,result)=>{
      if(error){
        console.log("awla");
      }else{
        console.log("deleted");
        res.redirect("/");
      }
    });
  
    
  }else{
    //pull is a native mongodb function that remove an element from a array in mongodb.
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItem}}},(error,result)=>{
      if(error){
        console.log(error);
      }else{
        res.redirect("/"+listName);
      }
    });

    
  }

  

})


const listSchema = new mongoose.Schema({
  name: String,
  items:[itemSchema]
})

const List = new mongoose.model("list",listSchema);


app.get("/:customListName",(req,res)=>{
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name:customListName},(error,result)=>{

      if(!error){
        if(!result){
          
          const customList = new List({
            name: customListName,
            items: defaultItems
          });

          customList.save();
          res.redirect("/"+customListName);

        }else{
          res.render("list", {listTitle: result.name, newListItems: result.items});
        }
      }
  })
})


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port,()=>{
  console.log("Server started on port 3000");
});
