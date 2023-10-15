//jshint esversion:6
const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const _=require("lodash");
const app = express();
const port = process.env.PORT || 3001;
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect('mongodb+srv://username:pass@cluster0.rb7aj1k.mongodb.net/todolistDB');
const itemSchema = new mongoose.Schema({
  name:String
})
const Item = mongoose.model("item",itemSchema);
const item1 = new Item({name:"welcome to your to do list"});
const item2 = new Item({name:"hit the + button to add a new item."});
const item3 = new Item({name:"<-- hit this to del"});

const deufltItems =[item1,item2,item3];
const listSchema = new mongoose.Schema({
  name:String,
  items:[itemSchema],
});
const List = mongoose.model("List",listSchema);


app.get("/", function(req, res) {
  const a = Item.find({}).then(function(itemss){
    if (itemss.length ==0){
      Item.insertMany(deufltItems);
      res.redirect("/");
    }
    else{
      const day = "Today";
      res.render("list", {listTitle: day, newListItems: itemss});
      } 

  })});
  app.get("/:customListName", function(req,res){
    const abc = _.capitalize(req.params.customListName);
     List.findOne({name:abc}).then(function (results,err){
      if(!err){

       if(!results){
        const list = new List({
          name:abc,
          items: deufltItems,
        });
        list.save();
        console.log("added");
        res.redirect("/"+ abc);
      } else {
        res.render("list", {listTitle: abc, newListItems:results.items });  
      }}
     })

    
  
  }); 

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  console.log(listName);
  const item4 = new Item({name:itemName,});
  if(listName === "Today"){
  item4.save();
  res.redirect("/");
  } else {
    List.findOne({name:listName}).then(function (results,err){
      results.items.push(item4);
      results.save();
      res.redirect("/"+listName);
    })
    
    
  }

});
app.post("/delete", function(req, res){
 const ab = req.body.checkbox;
 const listN = req.body.listName
 console.log(ab);
 if(listN==="Today"){
  Item.findByIdAndRemove(ab).then(function(){
    console.log("Data deleted"); // Success
    res.redirect("/");    
  
  }).catch(function(error){
    console.log(error); // Failure
  });
 } else {
  List.findOneAndUpdate({name:listN},{$pull:{items:{_id: ab}}}).then(function (results,err){
if(!err){
  res.redirect("/" +listN);
}
  })
 }


});



app.get("/about", function(req, res){
  res.render("about");
});

app.listen(port, function() {
  console.log(`Example app listening on port ${port}!`);
});
