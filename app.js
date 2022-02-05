// Oluturulan ToDoListin linki
// https://whispering-cove-30200.herokuapp.com/

// Her Değişiklikte 
// git add.  / git commit -m "" / git push heroku master

//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
// Requiring the Data base
const mongoose = require("mongoose");
const _ =require("lodash") ;

const {
  redirect
} = require("express/lib/response");
const { add } = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

// MongoDB data base ine ulaşıyor ve todolistDB adli bir DB oluşturuyor aşağıdaki Url ile bağlantılı
mongoose.connect("mongodb+srv://admin-can:can9598@cluster0.gvhit.mongodb.net/todolistDB", {
  useNewUrlParser: true
});
 
// Schemer for the Items
const itemsScheme = {
  name: String
};
// Creating the Mongo model ---after this line of code Item act like a Constructor Function
const Item = mongoose.model("Item", itemsScheme);

// Creating 3 new item -put them to an array -and insert the array into the Item collection
 
const item_1 = new Item({
  name: "Welcome to your todolist!"
});

const item_2 = new Item({
  name: "Hit the + button to add a new item."
});

const item_3 = new Item({
  name: "<-- Hit this to delete an item."
});

const defaultItems = [item_1, item_2, item_3];

// Schema of the new created list
const listScheme = {
  name: String,
  items: [itemsScheme]
};
//Creating a new Table(collector) called List
const List = mongoose.model("List", listScheme);


app.get("/", function (req, res) {


  // Find ile bulunan koşulu sağlayan her Itemı bul ve  foundItems arrayinini içerisine at
  // Burada bana bir array return ediyor find
  Item.find({}, function (err, foundItems) {

    if (foundItems.length === 0) {
      // Inserting the elemants of the items  into the Item collection
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Succesfully added to the array");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: foundItems
      });
    }

  });
});

app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const newItem = new Item({
    name: itemName
  });

  if (listName === "Today") {
    newItem.save();
    res.redirect("/");
  } else {
    List.findOne({
      name: listName
    }, function (err, foundList) {

      foundList.items.push(newItem);
      foundList.save();
      res.redirect("/" + listName);
    });
  }

  // Bu şekil de insert edebilirdim objeyi
  /* Item.insertOne(newItem,function(err){
    if(err){
      console.log(err);
    }else{
      console.log(Good);
    }
  }) */
});

app.post("/delete", function (req, res) {

  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log("Delete is complated");
        res.redirect("/");
      }
    });
  } else {

    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id:checkedItemId}}} , function(err,foundList){
      if(!err) {
        res.redirect("/"+ listName) ; 
      }
    })

  }

});



app.get("/:customListName", function (req, res) {

  const customListName = _.capitalize(req.params.customListName);

  // Burada bana bir object return ediyor called "foundList"
  List.findOne({
    name: customListName
  }, function (err, foundList) {
    if (!err) {
      if (!foundList) {

        // Create a new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });

        list.save();
        res.redirect("/" + customListName);
      } else {
        // Show the existing list
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items
        });
      }
    }
  });
});

 



app.get("/about", function (req, res) {
  res.render("about");
});



 // Herokunun oluşturduğu portta sayfayı göster sotun çıkarsa local 3000 de çalıştır
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}


app.listen(port, function () {
  console.log("Server has started succesfully");
});

