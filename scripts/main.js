// CORE JAVASCRIPT FILE (used for functions and interactivity) FOR THE PROJECT
// Created by Michael D Wu, 2018-2020

// -- GLOBAL VARIABLES AND ARRAYS --
// Array will store user-inputted servings of each individual food item
// Order is: [beef, chicken, pork, fish, eggs, milk, cheese, fruits, veg, wheat, rice, oil, nuts, beans]
// Could probably use an ordered dictionary for a bit more clarity here but this suffices
var foodServings_array = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var surveyResults_array = [0, 0, 0, 0, 0]
var annualCF = 0;
var annualNF = 0;
var annualWF = 0;


// NEXT AND PREVIOUS BUTTON CONTROLS

var slideIndex = 1;
showSlides(slideIndex);

function plusSlides(n) {
  showSlides(slideIndex += n);
}

function currentSlide(n) {
  showSlides(slideIndex = n);
}

function showSlides(n) {
  var i;
  var slides = document.getElementsByClassName("mySlides");
  var dots = document.getElementsByClassName("dot");
  if (n > slides.length) {slideIndex = 1} 
  if (n < 1) {slideIndex = slides.length}
  for (i = 0; i < slides.length; i++) {
      slides[i].style.display = "none"; 
  }
  for (i = 0; i < dots.length; i++) {
      dots[i].className = dots[i].className.replace(" active", "");
  }
  slides[slideIndex-1].style.display = "block"; 
  dots[slideIndex-1].className += " active";
}

// -- UPDATING THE RADIO VALUES SO THAT WE CAN INPUT USER SLIDE RESULTS INTO FIREBASE --

function updateRadioValue() { 
  var ele = document.getElementsByName('radio-gender'); 
    
  for(i = 0; i < ele.length; i++) { 
      if(ele[i].checked)
      surveyResults_array[0] = ele[i].value; 
  } 

  var ele = document.getElementsByName('radio-age'); 
    
  for(i = 0; i < ele.length; i++) { 
      if(ele[i].checked)
      surveyResults_array[1] = ele[i].value; 
  } 

  var ele = document.getElementsByName('radio-ethnicity'); 
    
  for(i = 0; i < ele.length; i++) { 
      if(ele[i].checked)
      surveyResults_array[2] = ele[i].value; 
  } 

  var ele = document.getElementsByName('radio-income'); 
    
  for(i = 0; i < ele.length; i++) { 
      if(ele[i].checked)
      surveyResults_array[3] = ele[i].value; 
  } 

  surveyResults_array[4] = document.getElementById('zipcode').value; 
} 

// -- FINAL SUBMIT BUTTON ON STEP 4 OF 4 --
// AddEventListener to "listen" for clicks on the calculate button

submitButton.addEventListener("click", function(){
  // Connecting the Firebase Database with Our app
  firebase.initializeApp({
    apiKey: "AIzaSyBsPuGniKm5JN2AOoxtS_dMhkV3qoyx0wE",
    authDomain: "foodprint-calculator.firebaseapp.com",
    databaseURL: "https://foodprint-calculator.firebaseio.com",
    projectId: "foodprint-calculator",
    storageBucket: "",
    messagingSenderId: "911716885067",
    appId: "1:911716885067:web:90a30a6d8cff68931c63ce"
  });
  var firestore = firebase.firestore();
  var db = firebase.firestore();

  // Generating a random ID
  // https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
  // dec2hex :: Integer -> String
  // i.e. 0-255 -> '00'-'ff'
  function dec2hex (dec) {
    return ('0' + dec.toString(16)).substr(-2)
  }

  // generateId :: Integer -> String
  function generateId (len) {
    var arr = new Uint8Array((len || 40) / 2)
    window.crypto.getRandomValues(arr)
    return Array.from(arr, dec2hex).join('')
  }

  var id = generateId();

  // Calling function to update the entries in foodServings_array
  updateRadioValue();

  // Setting the values received from the user into the Firebase Database 
  return db.collection("UserData").doc(id).set({
    footprint_Carbon: annualCF.toString() + 'kg',
    footprint_Nitrogen: annualNF.toString() + 'g',
    footprint_Water: annualWF.toString() + 'L',
    servings_beef: foodServings_array[0].toString(),
    servings_chicken: foodServings_array[1].toString(),
    servings_pork: foodServings_array[2].toString(),
    servings_fish: foodServings_array[3].toString(),
    servings_eggs: foodServings_array[4].toString(),
    servings_milk: foodServings_array[5].toString(),
    servings_cheese: foodServings_array[6].toString(),
    servings_fruit: foodServings_array[7].toString(),
    servings_vegetables: foodServings_array[8].toString(),
    servings_wheat: foodServings_array[9].toString(),
    servings_rice: foodServings_array[10].toString(),
    servings_oil: foodServings_array[11].toString(),
    servings_nuts: foodServings_array[12].toString(),
    servings_beans: foodServings_array[13].toString(),
    user_gender: surveyResults_array[0].toString(),
    user_age: surveyResults_array[1].toString(),
    user_ethnicity: surveyResults_array[2].toString(),
    user_income: surveyResults_array[3].toString(),
    user_zipcode: surveyResults_array[4].toString(),
  })
  .then(function() {
    console.log("Document successfully written!");
    plusSlides(1);
  })
  .catch(function(error) {
    console.log("Error writing document: ", error);
  });
});

// -- UPDATING THE THREE ENVIRONMENTAL FOODPRINT DESCRIPTORS --

function showCarbon(){
  document.getElementById("carbon-description").innerHTML = "<p id = 'bold'>Your annual contribution to climate change:</p>" + numberWithCommas(Math.round(annualCF/8.7))
  + " gallons of gasoline burned or " + numberWithCommas(Math.round(annualCF * 0.0165)) + " square feet of ice melted every year.<sup>2,3</sup>"
  + " Meat and dairy account for three-fourths of all carbon emissions from an average American diet.<sup>4</sup>"
}

function showNitrogen(){
  document.getElementById("nitrogen-description").innerHTML = "<p id = 'bold'>Your annual contribution to nutrient pollution:</p>" + numberWithCommas(Math.round(annualNF/1000*298)) + 
  "kg of additional carbon, " + numberWithCommas(Math.round(annualNF/1000*298/8.7)) + " gallons of gasoline burned, or " + numberWithCommas(Math.round(annualNF*10/453.59)) + " pounds of fertilizer polluted every year.<sup>1,2</sup>"
}

function showWater(){
  document.getElementById("water-description").innerHTML = "<p id = 'bold'>Your annual consumption of limited freshwater resources:</p> " + numberWithCommas(Math.round(annualWF/35*0.264172)) +
  " bathtubs of water every year or "
   + numberWithCommas(Math.round(annualWF/35*0.264172/365)) + " bathtubs of water every day.<sup>5</sup> Beef, cheese, and pork are the three highest sources of water use in food production.<sup>1</sup>"
}

// Basic function for formatting a number with commas, Standard regex probably from StackOverflow
function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// -- UPDATING THE THREE ENVIRONMENTAL FOODPRINT RESULTS/VALUES --

// FIRST: the right-hand labels of the sliders based on user-inputted values on the slider
var rangeSlider = function(){
  
  // Storing each trait/class of the slider in a variable
  var slider = $('.range-slider'), range = $('.range-slider__range'), value = $('.range-slider__value');

  // Storing each slider ID in a variable -- for individual foods
  var beef = $('#beef'), chicken = $('#chicken'), pork = $('#pork'), fish = $('#fish'), eggs = $('#eggs'), milk = $('#milk'), cheese = $('#cheese'),
      fruits = $('#fruits'), vegetables = $('#vegetables'), wheat = $('#wheat'), rice = $('#rice'), oil = $('#oil'), nuts = $('#nuts'), beans = $('#beans');

  // Changing the slider label value inside the HTML span attribute
  slider.each(function(){

    value.each(function(){
      var value = $(this).prev().attr('value');
      $(this).html(value);
    });

    range.on('input', function(){
      $(this).next(value).html(this.value);
    });

  });

  // Storing the user-inputted servings of the individual food groups into 'foodServings_array'
  beef.on('input', function(){foodServings_array[0] = document.getElementById("beef").value;});
  chicken.on('input', function(){foodServings_array[1] = document.getElementById("chicken").value;});
  pork.on('input', function(){foodServings_array[2] = document.getElementById("pork").value;});
  fish.on('input', function(){foodServings_array[3] = document.getElementById("fish").value;});
  eggs.on('input', function(){foodServings_array[4] = document.getElementById("eggs").value;});
  milk.on('input', function(){foodServings_array[5] = document.getElementById("milk").value;});
  cheese.on('input', function(){foodServings_array[6] = document.getElementById("cheese").value;});
  fruits.on('input', function(){foodServings_array[7] = document.getElementById("fruits").value;});
  vegetables.on('input', function(){foodServings_array[8] = document.getElementById("vegetables").value;});
  wheat.on('input', function(){foodServings_array[9] = document.getElementById("wheat").value;});
  rice.on('input', function(){foodServings_array[10] = document.getElementById("rice").value;});
  oil.on('input', function(){foodServings_array[11] = document.getElementById("oil").value;});
  nuts.on('input', function(){foodServings_array[12] = document.getElementById("nuts").value;});
  beans.on('input', function(){foodServings_array[13] = document.getElementById("beans").value;});

  // Updating the bottom Carbon, Nitrogen, and Water foodprint labels
  range.on('input', function(){
    // Storing C/N/H2O footprints per servings of food in arrays
    // Order is: [beef, chicken, pork, fish, eggs, milk, cheese, fruits, veg, wheat, riceX, oil, nutsX, beansX]
    // kg of Carbon per serving of each food item
    var carbon_footprints = [2.25, 0.434, 0.587, 0.38, 0.20, 0.31, 0.56, 0.006, 0.16, 0.03, 0.11, 0.022, 0.069, 0.034];
    // g of Nitrogen lost per serving of each food item
    var nitrogen_footprints = [28, 9.93, 11.3 , 7.03, 3.49, 4.70, 5.32, 0.378, 0.182, 0.74, 0.53, 0.0028, 0.70, 0.251];
    // L of Water consumed per serving of each food item
    var water_footprints = [561, 128, 238, 0, 74.1, 168, 165, 70, 23, 100, 130, 44.8, 86, 72.5];

    // Initializing footprint variables, resetting values after every time user inputs something on slider
    var totalCF = 0;
    var totalNF = 0;
    var totalWF = 0;

    // Updating the footprint variables to store total carbon, nitrogen, and water footprints
    // Multiply servings of food (stored in foodServings_array) by footprint / serving (stored in C/N/H2O_footprints)
    // To get individual footprint, those individual footprints are accumulated in the total variable
    var i;
    for (i = 0; i <= 13; i++) { 
      totalCF += foodServings_array[i] * carbon_footprints[i];
      totalNF += foodServings_array[i] * nitrogen_footprints[i];
      totalWF += foodServings_array[i] * water_footprints[i];
    }

    annualCF = Math.round(totalCF*365);
    annualNF = Math.round(totalNF*365);
    annualWF = Math.round(totalWF*365);

    // Updating HTML labels
    // *365 to get annual footprint, Math.round for a cleaner UI
    document.getElementById("carbonKG").innerHTML = numberWithCommas(annualCF) + "kg";
    document.getElementById("nitrogenG").innerHTML = numberWithCommas(annualNF) + "g";
    document.getElementById("waterL").innerHTML = numberWithCommas(annualWF) + "L";

    showCarbon();
    showNitrogen();
    showWater();
  });
};
  
rangeSlider();

// Adding commas to number
function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}