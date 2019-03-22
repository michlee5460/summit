$(document).ready(function() {
  var input = window.location.search.split("&");
  console.log(input);
  var searchTerm = input[0].substring(input[0].indexOf("=") + 1);
  var datefrom = "";
  var dateto = "";
  var location = "";

  if (input[1] != null) {
    datefrom = input[1].substring(input[1].indexOf("=") + 1);
  }

  if (input[2] != null) {
    dateto = input[2].substring(input[2].indexOf("=") + 1);
  }

  if (input[3] != null) {
    location = input[3].substring(input[3].indexOf("=") + 1);
  }

  var refinedSearchBar =
  "<form id='search' action='results.html' method='GET'>" +
  "<input id='searchBar' type='text' placeholder='Search' name='search'" +
  "value='" + searchTerm + "'>" +
  "<br>" +
  "<span class='searchspan'>Date Range (Year-Month-Day):</span>" +
  "<input class='dateRange' type='text' placeholder='####-##-##'" +
  "name='datefrom' value='" + datefrom + "'>" +
  "<span class='searchspan'>to</span>" +
  "<input class='dateRange' type='text' placeholder='####-##-##'" +
  "name='dateto' value='" + dateto + "'>" +
  "<br>" +
  "<span class='searchspan'>Location:</span>" +
  "<input id='location' type='text' name='location' value='" + location + "'>" +
  "<button id='refineSearchButton' type='submit'>Refine Results</button>" +
  "</form>";

  if (searchTerm == ""){
    $("#errorMsg").append("Please enter a keyword.")
  }
  else {
    $("#searchBar").val(searchTerm);
    $.get("https://images-api.nasa.gov/search?q=" + searchTerm, function(data){
      var results = data.collection.items;
      var numPics = results.length;
      console.log(data);

      // If there are no result images
      if (numPics == 0) {
        $("#errorMsg").append("No results available for \"" +
          searchTerm + "\". Please enter a new keyword.")
        console.log("nothing");
      }
      // Otherwise, if there are result images
      else {
        document.getElementById("resultMsg").innerHTML = "Results for \"" +
          searchTerm + "\"" + ".";
        var x = 0;

        for (i = 0; i < numPics; i++){

          resultdate = results[i].data[0].date_created.substring(0,10);
          resultlocation = results[i].data[0].location;

          // Beginning date filter
          if (datefrom != "" && resultdate != null) {
            if (dateCompare(resultdate, datefrom) == -1) continue;
          }

          // End date filter
          if (dateto != "" && resultdate != null) {
            if (dateCompare(resultdate, dateto) == 1) continue;
          }

          // Location filter
          if (location != "") {
            if (resultlocation == null) continue;
            var llocation = location.toLowerCase();
            var lresultlocation = resultlocation.toLowerCase();
            if (!(lresultlocation.includes(llocation))) continue;
          }

          // No image available filter
          var img = document.createElement("img");
          if (data.collection.items[i].links == null){
            img.setAttribute("alt", "No Image Available");
          }
          else {
            var source = data.collection.items[i].links[0].href;
            img.setAttribute("src", source);
          }
          img.setAttribute("class", "resultImg");
          var title = document.createElement("p");
          var titletxt = data.collection.items[i].data[0].title;
          title.setAttribute("class", "restitle");
          $(title).append(titletxt);
          $(title).append(" (" + resultdate + ")");
          $("#col" + x%3).append(img);
          $("#col" + x%3).append(title);
          console.log(resultlocation);
          if (resultlocation != null) {
            var locpar = document.createElement("p");
            locpar.setAttribute("class", "reslocation");
            title.setAttribute("class", "restitlewithloc");
            locpar.append("Location: " + resultlocation);
            $("#col" + x%3).append(locpar);
          }
          x++;
        }
        if (x == 0) $("#errorMsg").append("No images match the search parameters. " +
          "Please try again.");
      }
    });

    $("#refiner").click(function () {
      console.log("click");
      $("#search").replaceWith(refinedSearchBar);
      $(".results").css("margin-top", "245px");
    });
  }
});

// dateCompare(d1, d2) =
// -1 if d1 is before d2
// 0 if d1 = d2
// 1 if d1 is after d2
function dateCompare(d1, d2) {
  d1year = d1.substring(0,4);
  d1month = d1.substring(5,7);
  d1day = d1.substring(8,10);
  d2year = d2.substring(0,4);
  d2month = d2.substring(5,7);
  d2day = d2.substring(8,10);
  if (d1year < d2year) return -1;
  else if (d1year > d2year) return 1;
  else {
    // d1year = d2year
    if (d1month < d2month) return -1;
    else if (d1month > d2month) return 1;
    else {
      // d1month = d2month
      if (d1day < d2day) return -1;
      else if (d1day > d2day) return 1;
      else return 0;
    }
  }
}
