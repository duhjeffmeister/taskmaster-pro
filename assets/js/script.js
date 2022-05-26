//initial empty object to hold tasks
var tasks = {};

//Constructs a task. pass in the text, date, and which list the task belongs
var createTask = function (taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");

  var taskSpan = $("<span>").addClass("badge badge-primary badge-pill").text(taskDate);
  
  var taskP = $("<p>").addClass("m-1").text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);

  // check due date
  auditTask(taskLi);

  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

//loads existing tasks objects from local storage
var loadTasks = function () {
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }

  // loop over object properties. list = the name of the task list (e.g. toDo, inProgress, etc). arr = the array of task objects contained in that list
  $.each(tasks, function (list, arr) {
    // then loop over sub-array, the task object containing the text, date, and list value
    arr.forEach(function (task) {
      createTask(task.text, task.date, list);
    });
  });
};

//saves the current tasks array to localStorage
var saveTasks = function () {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

var auditTask = function(taskEl) {
  // get date from task element
  var date = $(taskEl).find("span").text().trim();

  // convert to moment object at 5:00 pm
  var time = moment(date, "L").set("hour", 17);

  // remove any old classes from element
  $(taskEl).removeClass("list-group-item-warning list-group-item-danger");

  // aply new class if task is near/over due date
  if (moment().isAfter(time)) {
    $(taskEl).addClass("list-group-item-danger");
  }
  else if (Math.abs(moment().diff(time, "days")) <= 2) {
    $(taskEl).addClass("list-group-item-warning");
  }
};

// makes the card items in the list columns sortable
// connectWith property connects the initial element with another element, in this case all of the list-groups and cards are connected for the sorting functionality
$(".card .list-group").sortable({
  connectWith: $(".card .list-group"),
  scroll: false,
  tolerance: "pointer",
  helper: "clone",
  activate: function(event) {
    console.log("activate", this);
  },
  deactivate: function(event) {
    console.log("deactivate", this);
  },
  over: function(event) {
    console.log("over", this);
  },
  out: function(event) {
    console.log("out", this);
  },
  update: function(event) {
  // array to store the task dat in
  var tempArr = [];

    // loop over current set of children in sortable list
    $(this).children().each(function() {
      var text = $(this)
        .find("p")
        .text()
        .trim();

      var date = $(this)
        .find("span")
        .text()
        .trim();
    })
    console.log(tempArr);
  }
});
//click listener for event description <p> elements. Added to all elements with the .list-group class, so it can monitor for clicks in <p> elements inside 
//the list columns as the <p> elements are created
$(".list-group").on("click", "p", function () {
  //'this' refers to the click event target, i.e, the <p> element
  //placing the jQuery $ before it converts it into a jQuery object, so that the .text() method can be called on it
  //.text() with no arguments returns the textContent of the object
  //.trim() removes leading and trailing whitespace
  // methods can be chained, even when they're placed on new lines. Remember to terminate the last method in the chain with a ;
  var text = $(this)
    .text()
    .trim();

  //creates a textarea input field element (if we used "textarea" instead of "<textarea>" it would select all existing textarea elements)
  var textInput = $("<textarea>")
    //adds the form-control class to the new field
    .addClass("form-control")
    //adds the text in the <p> element as the starting value of the input field
    .val(text);

  //swaps out the existing <p> element for the new <textarea> element
  $(this).replaceWith(textInput);

  //auto highlights and places cursor in the text element
  textInput.trigger("focus");
});

//listens for the user to "blur" or click away from an element that's in focus.
//in this case, when the user interacts with anything other than the focused text area, the event triggers this function
$(".list-group").on("blur", "textarea", function () {

  //gets the text value of the input field and trims whitespace
  var text = $(this)
    .val()
    .trim();

  //get the parent ul's id attribute and edit it to get a string that matches one of the four task array property names (toDo, inProgress, inReview, done)
  var status = $(this)
    //the closest element with the list-group class will be the parent element
    .closest(".list-group")
    //get the id of that parent element
    .attr("id")
    // removes "list-" from the id string, leaving only the last portion (e.g. "toDo")
    .replace("list-", "");

  //get the task's position in the list of other li elements
  var index = $(this)
    //targets the parent li element that the <p> and <textarea> are part of
    .closest(".list-group-item")
    // gets the index of that list element in the list
    .index();

  //updates the tasks array with the new info
  tasks[status][index].text = text;

  //saves the updated array to localStorage
  saveTasks();

  //recreate <p> element
  var taskP = $("<p>")
    .addClass("m-1")
    .text(text);

  //replace textarea with new p element
  $(this).replaceWith(taskP);

});

//listener for editing due dates on tasks
$(".list-group").on("click", "span", function () {
  // get current text
  var date = $(this).text().trim();

  // create new input element
  var dateInput = $("<input>").attr("type", "text").addClass("form-control").val(date);

  $(this).replaceWith(dateInput);

  // enable jQuery ui datepicker
  dateInput.datepicker({
    minDate: 1,
    onClose: function() {
      // when calendar is closed, force a "change" event on the 'dateInput'
      $(this).trigger("change");
    }
  });

  // automaticaly bring up the calendar
  dateInput.trigger("focus");

});

//listener for when date gets "blurred"
$(".list-group").on("change", "input[type='text']", function () {

  //get current text from input
  var date = $(this)
    //use val for inputs instead of text
    .val()
    .trim();

  //get the parent ul's id attribute
  var status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");

  //get the index of the parent li element
  var index = $(this)
    .closest(".list-group-item")
    .index();

  //update task in array and re-save to localstorage
  tasks[status][index].date = date;
  saveTasks();

  //recreate span element
  var taskSpan = $("<span>")
  .addClass("badge badge-primary badge-pill")
  .text(date);

  //replace input with span
  $(this).replaceWith(taskSpan);
});

// droppable jQuery widget
$("#trash").droppable({
  // controls which draggable elements are acecepted by the droppable. can be a selector or function.
  accept: ".card .list-group-item",

  // specifies which mode to use for testing whether a draggable is hovering over a droppable
  // touch  refers to draggable overlapping the droppable by any amount
  tolerance: "touch",

  //event that is triggered when an accepted draggable is dropped on the droppable (based on the tolerance option)
  drop: function(event, ui) {
    ui.draggable.remove();
    console.log("drop");
  },
  
  //triggered when an accepted draggable is dragged over the droppable (based on the tolerance option)
  over: function(event, ui) {
    console.log("over");
  },

  //triggered when an accepted draggable is dragged out of hte droppable (based on the tolerance option)
  out: function(event, ui) {
    console.log("out");
  }
});




// "A modal (sometimes called a pop-up) is an overlay that requires user interaction before returning to the main application"
// here, modal refers to the item displayed when the Add Task button is clicked
// modal was triggered
$("#task-form-modal").on("show.bs.modal", function () {
  // clear values from the input fields when the modal is first shown to user
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function () {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-primary").click(function () {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  // basic validation, if text is present in both inputs, then run the createTask function
  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });

    //updates localStorage with new tasks
    saveTasks();
  }
});

// select the form element with an id of "modalDueDate" using jQuery, then chain .datepicker() method to it.
$("#modalDueDate").datepicker({
  minDate: 1
});

// remove all tasks
$("#remove-tasks").on("click", function () {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  //updates local storage with new empty task arrays
  saveTasks();
});

// load tasks for the first time
loadTasks();