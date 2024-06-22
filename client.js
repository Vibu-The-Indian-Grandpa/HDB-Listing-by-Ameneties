
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";





document.addEventListener("DOMContentLoaded", async function () {

    const firebaseConfig = {
        apiKey: "AIzaSyA6U-AwHL4fSOnmqjEVo1lU8rFWDhPuFDY",
        authDomain: "hdbamenities.firebaseapp.com",
        projectId: "hdbamenities",
        storageBucket: "hdbamenities.appspot.com",
        messagingSenderId: "410996522613",
        appId: "1:410996522613:web:1193bc1b3df1b50e93423c",
        measurementId: "G-RY5WH9KYXF"
    };


    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const analytics = getAnalytics(app);

    firebase.initializeApp(firebaseConfig)


    let HDBinfo;

    const schoolData = [];
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
    async function fetchSchoolData() {
        const datasetId = "d_688b934f82c1059ed0a6993d2a829089"
        const url = "https://data.gov.sg/api/action/datastore_search?resource_id=" + datasetId;
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch data');
                }
                return response.json();
            })
            .then(data => {
                // console.log(data);

                // Extract records
                const records = data.result.records;

                // Filter to keep only school_name and postal_code
                records.forEach(record => {
                    schoolData.push({
                        school_name: record.school_name,
                        address: record.address,
                        postal_code: record.postal_code,
                        level: record.mainlevel_code
                    });
                });
                // Print the filtered records
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
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

    async function getCoordinates(address) {
        const url = `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${encodeURIComponent(address)}&returnGeom=Y&getAddrDetails=Y&pageNum=1`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const resultsDict = await response.json();
            console.log(resultsDict);

            if (resultsDict.results.length > 0) {
                return {
                    latitude: resultsDict.results[0].LATITUDE,
                    longitude: resultsDict.results[0].LONGITUDE
                };
            } else {
                return null; // or handle the case where no results are found
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            return null; // or handle the error appropriately
        }
    }
    /******************************************************************************/
    // async await 

    async function getAllData() {
        fetchAllCollections();
        HDBinfo = HDBOption(HDBList);
    };

    /******************************************************************************/

    function distanceCalculation(lo1, la1, lo2, la2, d2r) {
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

    function getListOfAddress(list) {
        let listOfAddress = [];
        for (const item of list) {
            listOfAddress.add(item.block + " " + item.street_name);
        }

        return listOfAddress;
    }

    function removeDuplicates(list) {
        let seen = new Set(); // To track unique concatenated strings
        return list.filter(item => {
            let key = `${item.flat_type} ${item.block} ${item.street_name} ${item.flat_model}`;
            if (!seen.has(key)) {
                seen.add(key);
                return true; // Keep this item in the filtered array
            }
            return false;
        });
    }

    function HDBOption(data) {
        let LISTS = [...data];
        const D2R = Math.PI / 180;
        return {
            ////////////////////////////////
            getSpecifiedHDB(data) {
                const specifiedLocations = data.map(location => getTownByLocation(LISTS, location));
                const uniqueSpecifiedLocations = removeDuplicates(specifiedLocations);

                return uniqueSpecifiedLocations;
            },
            async getListOfCoordinates(uniqueLocationList) {
                const listOfAddress = getListOfAddress(uniqueLocationList);
                let listOfCoordinates = [];

                for (const item of listOfAddress) {
                    const coordinates = await getCoordinates(item);
                    listOfCoordinates.add(coordinates);
                }
                return listOfCoordinates;
            },
            getListOfDist(specifiedCoordList, amenityCoordList, type) {
                let leastDistance;
                let tempDistance;
                let arrayOfLeastDist = [];
                let arrayOfamenityCoord = [];

                for (let i = 0; i < specifiedCoordList; i++) {
                    // loop through all the locations
                    for (let j = 0; j < amenityCoordList; j++) {
                        // loop through all the amenity locations
                        tempDistance = distanceCalculation(specifiedCoordList[0], specifiedCoordList[1], amenityCoordList[0], amenityCoordList[1], D2R);
                        if (leastDistance > tempDistance) {
                            leastDistance = tempDistance;
                            arrayOfamenityCoord = amenityCoordList[j];
                        }
                    }
                    arrayOfLeastDist.push([arrayOfamenityCoord, leastDistance]);
                }

                return arrayOfLeastDist;
            }
            /////////////////////////////////
        }
    };

    /******************************************************************************/
    await getAllData();


    // Method to push amenitites location into an array


    // Method to compare and push the values in

    //Define the forms and etc
    const form = document.getElementById("form");
    const MRTStationCheckbox = document.getElementById("MRTStationCheckbox");
    const MallCheckbox = document.getElementById("MallCheckbox");
    const SchoolCheckbox = document.getElementById("SchoolCheckbox");

    // Get slider values
    const MRTSlider = document.getElementById("MRTSlider").value;
    const MallRangeSlider = document.getElementById("MallRangeSlider").value;
    const SchoolRangeSlider = document.getElementById("SchoolRangeSlider").value;

    const warningCard = document.getElementById("warningCard");

    /***********************************All Callbacks****************************************/

    form.addEventListener("submit", function (event) {
        console.log("Form.addEventListener");
        event.preventDefault();
        //Hides warning card if it was displayed
        warningCard.classList.add("d-none");

        let listOfSchool, listOfMall, listOfMrt, combinedList;
        let locationInput = document.getElementById("location").value;
        //error handling
        console.log(locationInput)

        let specifiedList = HDBinfo.getSpecifiedHDB(locationInput);

        let listOfSpecifiedCoord = HDBinfo.getListOfCoordinates(specifiedList);

        if (MRTStationCheckbox.checked) {
            // MRT List
            // run the function to get mrt
            // listOfMrt = HDBinfo.getListOfDist(listOfSpecifiedCoord, listOFMrt);
        }

        // Example: Check if Mall checkbox is checked
        if (MallCheckbox.checked) {
            // MALL LIST
            // run the function to get mall
            // listOFMall = HDBinfo.getListOfDist(listOfSpecifiedCoord, listOFMall);
        }

        // Example: Check if School checkbox is checked
        if (SchoolCheckbox.checked) {
            // SCHOOL LIST
            // CHECK FOR TYPE OF SCHOOL
            // run the function to get SCHOOL
            // listOFSchool = HDBinfo.getListOfDist(listOfSpecifiedCoord, listOFSCHOOL);
        }

        for (let i = 0; i < 10; i++) {
            // Retrieve the corresponding specified HDB object
            let specifiedHDB = specifiedList[i]; // Assuming combinedResults is sorted to match specifiedList

            // Create card element
            let card = document.createElement("div");
            card.classList.add("card");

            // Card content
            card.innerHTML = `
                <h3>${specifiedHDB.flat_type} - ${specifiedHDB.block} ${specifiedHDB.street_name}</h3>
                <p>Town: ${specifiedHDB.town}</p>
                <p>Storey Range: ${specifiedHDB.storey_range}</p>
                <p>Flat Area: ${specifiedHDB.flat_area} sqm</p>
                <p>Lease Commence Date: ${specifiedHDB.lease_commence_date}</p>
                <p>Remaining Lease: ${specifiedHDB.remaining_lease} years</p>
                <p>Resale Price: $${specifiedHDB.resale_price}</p>
                <p>${amenityName} Distance: ${distance.toFixed(2)} km</p>
            `;

            // Append card to results container
            resultsContainer.appendChild(card);
        }

        form.reset();
    });
});
