const Express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js")
const mongoose = require("mongoose");
const _ = require("lodash");

const app = Express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended :true}));
app.use(Express.static("public"));

mongoose.connect("mongodb+srv://dbuser:dbuser@cluster0.svgqw.mongodb.net/todoList", {useNewUrlParser:true, useUnifiedTopology:true, useCreateIndex: true, useFindAndModify:false });


const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({
  name:"Welcome to your TO-DO list"
});

const item2 = new Item({
  name: "Hit the plus button to add the item"
});

const item3 = new Item({
  name:"<--Hit this to Delete your accomplished item"
});

const defaultItems = [item1,item2,item3];

const listSchema = {
  name : String,
  items : [itemsSchema]
};

const List = mongoose.model("List",listSchema);

//let workItems = [];
app.get("/", function(req,res){
  Item.find({},function(err, foundItems){
    if(foundItems.length===0){
      Item.insertMany(defaultItems,function(err){
        if (err){
          console.log(err);
        }else{
          console.log("successfully added items");
        }
      });
      res.redirect("/");
    }else{
      res.render("list",{listTitle:"Today", newListItems: foundItems});
    }
  });
});


app.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({name:customListName},function(err,foundName){
    if(!err){
    if(!foundName){
      const list = new List({
        name: customListName,
        items: defaultItems
      });
      list.save();
      res.redirect("/"+ customListName);
    }else{
      res.render("list",{listTitle:foundName.name, newListItems: foundName.items});
      //console.log(foundName.name);
    }
  }
  });


});



app.post("/", function(req,res){
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const userItem = new Item({
   name: itemName
 });

   if(listName === "Today"){
     userItem.save();
     res.redirect("/");
   }else{
     List.findOne({name:listName},function(err, foundList){
       if(!err){
        foundList.items.push(userItem);
        foundList.save();
        res.redirect("/"+ listName);
       }
     });
   }
});

app.post("/delete",function(req,res){
  const checkedID = req.body.checkBox;
  const listName = req.body.list;

  if(listName==="Today"){
    Item.findByIdAndRemove(checkedID,function(err){
      if(!err){
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedID}}},function(err){
      if(!err){
      res.redirect("/"+listName);
    }
  });
      }
    });


app.listen(3000, function(req,res){
  console.log("server has started");
});
