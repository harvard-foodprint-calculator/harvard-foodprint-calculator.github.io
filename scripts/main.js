// CORE JAVASCRIPT FILE (used for functions and interactivity) FOR THE PROJECT
// Created by Michael D Wu, 2018-2020

// ***
// INITIALIZING GLOBAL VARIABLES AND ARRAYS
// ***

// Array will store user-inputted servings of each individual food item
// Order is: [beef, chicken, pork, fish, eggs, milk, cheese, fruits, veg, wheat, rice, oil, nuts, beans]
// Could probably use an ordered dictionary for a bit more clarity here but this suffices
// Starting value is 0 because the default is position 1, "never"
var foodServings_array = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

// Survey results array
// Order is: [diet, gender, age, ethnicity, income, country]
var surveyResults_array = [0, 0, 0, 0, 0, 0]
var annualCF = 0;
var annualNF = 0;
var annualWF = 0;


// ***
// NEXT AND PREVIOUS BUTTON CONTROLS
// CAROUSEL SLIDESHOW
// ***
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

// ***
// SUPPORTING FUNCTION FOR SUBMIT BUTTON
// ON STEP 3: UPDATING THE RADIO VALUES SO THAT WE CAN INPUT USER SLIDE RESULTS INTO FIREBASE
// ***
function updateSurveyValue() { 
  var ele = document.getElementById('dropdown-diet'); 
  surveyResults_array[0] = ele.options[ele.selectedIndex].value;

  var ele = document.getElementById('dropdown-gender'); 
  surveyResults_array[1] = ele.options[ele.selectedIndex].value;

  var ele = document.getElementById('dropdown-age'); 
  surveyResults_array[2] = ele.options[ele.selectedIndex].value;

  var ele = document.getElementById('dropdown-ethnicity'); 
  surveyResults_array[3] = ele.options[ele.selectedIndex].value;

  var ele = document.getElementById('dropdown-income'); 
  surveyResults_array[4] = ele.options[ele.selectedIndex].value;

  // surveyResults_array[4] = document.getElementById('radio-country').value; 
  var ele = document.getElementById("dropdown-country");
  var country = ele.options[ele.selectedIndex].value;
  // Need to exclude respondents from the European Union, wipe any survey results they have
  if(country == "European Union") {
    country = "blank";
    surveyResults_array[0] = "blank";
    surveyResults_array[1] = "blank";
    surveyResults_array[2] = "blank";
    surveyResults_array[3] = "blank";
    surveyResults_array[4] = "blank";
  }

  surveyResults_array[5] = country;
}

// ***
// SUPPORTING FUNCTION FOR SUBMIT BUTTON
// ON STEP 3 SUBMIT BUTTON PRESSED: CALCULATING THE CARBON FOOTPRINT WITH THE NEWLY UPDATED VALUES
// *** 
function calculateFootprint() {
  
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

  for (var i = 0; i <= 13; i++) { 
    totalCF += foodServings_array[i] * carbon_footprints[i];
    totalNF += foodServings_array[i] * nitrogen_footprints[i];
    totalWF += foodServings_array[i] * water_footprints[i];
  }

  // Remember that the user inputs their average weekly consumption numbers
  annualCF = Math.round(totalCF*12);
  annualNF = Math.round(totalNF*12);
  annualWF = Math.round(totalWF*12);

  // Updating HTML labels
  // *52 to get annual footprint, Math.round for a cleaner UI
  document.getElementById("carbonKG").innerHTML = numberWithCommas(annualCF) + "kg";
  document.getElementById("nitrogenG").innerHTML = numberWithCommas(annualNF) + "g";
  document.getElementById("waterL").innerHTML = numberWithCommas(annualWF) + "L";

  showEnvironmentAverageText()
  showEnvironmentText();
  
}

// ***
// ON STEP 3: FINAL SUBMIT BUTTON SUBMISSIONS TO FIREBASE
// enters all the user submitted values in Firebase
// ***
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

  // Calling the function to calculate the carbon footprints
  calculateFootprint();

  // Calling function to update the entries in foodServings_array
  updateSurveyValue();

  // Setting the values received from the user into the Firebase Database 
  return db.collection("Monthly-UserData").doc(id).set({
    annual_footprint_Carbon: annualCF.toString() + 'kg',
    annual_footprint_Nitrogen: annualNF.toString() + 'g',
    annual_footprint_Water: annualWF.toString() + 'L',
    monthly_servings_beef: foodServings_array[0].toString(),
    monthly_servings_chicken: foodServings_array[1].toString(),
    monthly_servings_pork: foodServings_array[2].toString(),
    monthly_servings_fish: foodServings_array[3].toString(),
    monthly_servings_eggs: foodServings_array[4].toString(),
    monthly_servings_milk: foodServings_array[5].toString(),
    monthly_servings_cheese: foodServings_array[6].toString(),
    monthly_servings_fruit: foodServings_array[7].toString(),
    monthly_servings_vegetables: foodServings_array[8].toString(),
    monthly_servings_wheat: foodServings_array[9].toString(),
    monthly_servings_rice: foodServings_array[10].toString(),
    monthly_servings_oil: foodServings_array[11].toString(),
    monthly_servings_nuts: foodServings_array[12].toString(),
    monthly_servings_beans: foodServings_array[13].toString(),
    user_gender: surveyResults_array[0].toString(),
    user_age: surveyResults_array[1].toString(),
    user_ethnicity: surveyResults_array[2].toString(),
    user_income: surveyResults_array[3].toString(),
    user_country: surveyResults_array[4].toString(),
  })
  .then(function() {
    console.log("Document successfully written!");
    plusSlides(1);
  })
  .catch(function(error) {
    console.log("Error writing document: ", error);
  });
});

// ***
// RESULTS DISPLAY: UPDATING THE THREE ENVIRONMENTAL FOODPRINT DESCRIPTORS
// ***

function showEnvironmentAverageText(){
  var national_metric; var needed_metric;

  if (annualCF < 680){
    national_metric = "below"; needed_metric = "and also below";
  } else if (annualCF < 1750 && annualCF >=680){
    national_metric = "below"; needed_metric = "but above";
  } else if (annualCF < 2250 && annualCF >=1750){
    national_metric = "above"; needed_metric = "and far above";
  } else {
    national_metric = "far above"; needed_metric = "and also far above";
  }

  document.getElementById("environ-average-description").innerHTML =
  annualCF + "kg of Carbon is " + national_metric + " the US national per capita average of 1750kg carbon emissions every year<sup>2</sup> "
  + needed_metric + " the 680kg maximum upper limit of a sustainable diet necesary to prevent climate catastrophe.<sup>3</sup>"
}

function showEnvironmentText(){
  document.getElementById("environment-description").innerHTML =
  // Carbon
  "For your reference, emitting " + numberWithCommas(annualCF) + "kgs of Carbon is equivalent to burning "
  + numberWithCommas(Math.round(annualCF/8.7))
  + " gallons of gasoline or melting " + numberWithCommas(Math.round(annualCF * 0.0165)) + " cubic feet of polar ice every year.<sup>4,5</sup> "
  // Nitrogen
  + numberWithCommas(annualNF) + "g of Nitrogen waste is equivalent to emitting an additional "
  + numberWithCommas(Math.round(annualNF/1000*298)) + 
  "kgs of carbon or polluting an additional "
  + numberWithCommas(Math.round(annualNF*10/453.59)) + " pounds of fertilizer every year.<sup>1,4</sup> "
  // Water
  + numberWithCommas(annualWF) + "L of water consumption is equivalent to using "
  + numberWithCommas(Math.round(annualWF/35*0.264172/365)) + " bathtubs of water every day!<sup>7</sup>"
}


// Basic function for formatting a number with commas, Standard regex probably from StackOverflow
function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// -- UPDATING THE THREE ENVIRONMENTAL FOODPRINT RESULTS/VALUES --

// FIRST: the right-hand labels of the sliders based on user-inputted values on the slider
var updateSelectButtonValues = function(){
  
  // Storing each slider ID in a variable -- for individual foods
  var beef = $('#beef .btn'), chicken = $('#chicken .btn'), pork = $('#pork .btn'),
    fish = $('#fish .btn'), eggs = $('#eggs .btn'), milk = $('#milk .btn'), cheese = $('#cheese .btn'),
    fruits = $('#fruits .btn'), vegetables = $('#vegetables .btn'), wheat = $('#wheat .btn'),
    rice = $('#rice .btn'), oil = $('#oil .btn'), nuts = $('#nuts .btn'), beans = $('#beans .btn');


  // Storing the user-inputted servings of the individual food groups into 'foodServings_array'
  beef.on('click', function(){foodServings_array[0] = $(this).find('input').val();});
  chicken.on('click', function(){foodServings_array[1] = $(this).find('input').val();});
  pork.on('click', function(){foodServings_array[2] = $(this).find('input').val();});
  fish.on('click', function(){foodServings_array[3] = $(this).find('input').val();});
  eggs.on('click', function(){foodServings_array[4] = $(this).find('input').val();});
  milk.on('click', function(){foodServings_array[5] = $(this).find('input').val();});
  cheese.on('click', function(){foodServings_array[6] = $(this).find('input').val();});
  fruits.on('click', function(){foodServings_array[7] = $(this).find('input').val();});
  vegetables.on('click', function(){foodServings_array[8] = $(this).find('input').val();});
  wheat.on('click', function(){foodServings_array[9] = $(this).find('input').val();});
  rice.on('click', function(){foodServings_array[10] = $(this).find('input').val();});
  oil.on('click', function(){foodServings_array[11] = $(this).find('input').val();});
  nuts.on('click', function(){foodServings_array[12] = $(this).find('input').val();});
  beans.on('click', function(){foodServings_array[13] = $(this).find('input').val();});


};
  
updateSelectButtonValues();

// Adding commas to number
function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

referencesButton.addEventListener("click", function(){
  plusSlides(1);
})

referencesButtonBack.addEventListener("click", function(){
  plusSlides(-1);
})