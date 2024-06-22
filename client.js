document.addEventListener("DOMContentLoaded", async function () {

    let HDBData, HDBByTown, HDBinfo;

    const HDBList = [];
    /***********************************************************************/
    // Load Data
    // Fetch data get and post

    let collectionId = 1; // Starting collection ID

    async function fetchCollectionData(collectionId) {
        const url = `https://api-production.data.gov.sg/v2/public/api/collections/${collectionId}/metadata`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                console.error(`Failed to fetch data for collection ID ${collectionId}`);
                return null;
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`Error fetching data for collection ID ${collectionId}:`, error);
            return null;
        }
    }

    async function fetchAllCollections() {
        try {
            while (true) {
                const data = await fetchCollectionData(collectionId);
                if (!data) {
                    // If no data is returned, break the loop
                    break;
                }
                HDBList.push(data);
                collectionId++;
            }
        } catch (error) {
            console.error('Error fetching collections:', error);
        }

        console.log(HDBList);
    }

    /******************************************************************************/
    // async await 

    async function getAllData() {
        HDBOption(fetchAllCollections());
    };

    /******************************************************************************/

    function locationConversion(lo1, la1, lo2, la2, d2r) {
        const R = 6367; // Radius of the Earth in kilometers
        const dlong = d2r * (lo2 - lo1);
        const dlat = d2r * (la2 - la1);
      
        const a = Math.pow(Math.sin(dlat / 2), 2) +
                  Math.cos(la1 * d2r) * Math.cos(la2 * d2r) *
                  Math.pow(Math.sin(dlong / 2), 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const dist = R * c;
      
        return dist;
      }

      function getTownByLocation(list, location) {
        for (const item of list) {
          if (item.town === location) {
            return item;
          }
        }
        return null; // or some default value
      }

    function HDBOption(data) {
        let LISTS = [...data];
        const D2R = Math.PI/180
        return {
            getSpecifiedHDB(data) {
                  const specifiedLocations = data.map(location => getObjectById(LISTS, location));

                  
            }
        }
    };

    /******************************************************************************/
    await getAllData();



    // Method to take in the location and push a new set of values into a new array

    // Method to convert the location to coordinates

    // Method to push amenitites location into an array

    // Method to compare and push the values in
    // Define the custom element
    customElements.define('custom-card', CustomCard);

    //Define the forms and etc
    const TownForm = document.getElementById("TownForm");

    const warningCard = document.getElementById("warningCard");
    const warningText = document.getElementById("warningText");



    let TownsListForDisplay = HDBinfo.displayTown();
    /***********************************All Callbacks****************************************/

    const callbackToDisplayTowns = (townList) => {


        const Towns = document.getElementById("showTownList");
        let index = 1;
        console.log(townList)
        townList.forEach((town) => {
            const displayItem = document.createElement("div");
            displayItem.innerHTML = `
                        <p class="card-text">
                            ${index}. ${town} <br>
                        </p>
                    </div>
                </div>
                `;
            console.log(displayItem)
            Towns.appendChild(displayItem);
            index++;
        });
    };
    //Calling the callbackToDisplayTowns
    callbackToDisplayTowns(TownsListForDisplay);

    TownForm.addEventListener("submit", function (event) {
        console.log("TownForm.addEventListener");
        event.preventDefault();
        //Hides warning card if it was displayed
        warningCard.classList.add("d-none");


        let townInput = document.getElementById("town").value;
        //error handling
        console.log(townInput)

        let TownsArray = HDBinfo.displayTown();
        //Split input into an array by filtering spaces and commas
        let townArrayOfNumbers = townInput.split(/,|\s/).filter(Boolean);

        //error handling
        console.log(townArrayOfNumbers);

        let validTowns = [];

        TownsArray.forEach((item) => {
            townArrayOfNumbers.forEach((number) => {
                if (item == TownsArray[number - 1]) {
                    validTowns.push(item);
                }
            });
        });

        if (validTowns.length !== townArrayOfNumbers.length) {
            warningCard.classList.remove("d-none");
            warningText.innerText = "Please enter your input in the valid format (i.e. 1, 2, 5 or 1 2 5)";
        } else {

            // This Clears lists and the console.log is for error handling
            console.log("Clear Lists");
            const FilteredExtremeList = document.getElementById("filterExtremeList");
            const FilteredAverageList = document.getElementById("filterAverageList");
            FilteredExtremeList.innerHTML = '';
            FilteredAverageList.innerHTML = '';

            console.log(validTowns);
            HDBinfo.displayFilterByTown(validTowns);
            HDBinfo.displayMeanMedianByTownAndFlatType(validTowns);
        };
        TownForm.reset();
    });
});
