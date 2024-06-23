
// import { initializeApp } from 'firebase/app';
// import { getDatabase, ref, get, child } from 'firebase/database';



import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, get, child } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

document.addEventListener("DOMContentLoaded", async function () {

    // Your Firebase configuration
    const firebaseConfig = {
        apiKey: "AIzaSyA6U-AwHL4fSOnmqjEVo1lU8rFWDhPuFDY",
        authDomain: "hdbamenities.firebaseapp.com",
        databaseURL: "https://hdbamenities-default-rtdb.asia-southeast1.firebasedatabase.app/",
        projectId: "hdbamenities",
        storageBucket: "hdbamenities.appspot.com",
        messagingSenderId: "410996522613",
        appId: "1:410996522613:web:1193bc1b3df1b50e93423c",
        measurementId: "G-RY5WH9KYXF"
    };
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const database = getDatabase(app);

    async function fetchMRTData() {
        // Example usage
        const dbRef = ref(getDatabase());
        get(child(dbRef, `MRT`)).then((snapshot) => {
            if (snapshot.exists()) {
            } else {
                console.log("No data available");
            }
        }).catch((error) => {
            console.error(error);
        }).finally(() => {
            console.log("Data fetched successfully");
        });

    }
    async function fetchMallData() {
        // Example usage
        const dbRef = ref(getDatabase());
        get(child(dbRef, `Shopping Mall`)).then((snapshot) => {
            if (snapshot.exists()) {
                MallList.push(...snapshot.val());
            } else {
                console.log("No data available");
            }
        }).catch((error) => {
            console.error(error);
        }).finally(() => {
            console.log("Data fetched successfully");
        });

    }



    let HDBinfo;

    const schoolData = [];
    const HDBList = [];
    const MRTList = [];
    const MallList = [];
    /***********************************************************************/
    // Load Data
    // Fetch data get and post

    let collectionId = 1; // Starting collection ID

    // async function fetchCollectionData(collectionId) {
    //     const url = `https://api-production.data.gov.sg/v2/public/api/collections/${collectionId}/metadata`;

    //     try {
    //         const response = await fetch(url);
    //         if (!response.ok) {
    //             console.error(`Failed to fetch data for collection ID ${collectionId}`);
    //             return null;
    //         }
    //         const data = await response.json();
    //         console.log(`Fetched data for collection ID ${collectionId}`);
    //         return data;

    //     } catch (error) {
    //         console.error(`Error fetching data for collection ID ${collectionId}:`, error);
    //         return null;
    //     }
    // }

    async function fetchAllRecords() {
        const datasetId = "d_8b84c4ee58e3cfc0ece0d773c8ca6abc";
        const url = "https://data.gov.sg/api/action/datastore_search?resource_id=" + datasetId;
        let arr = [];
        let limit = 1000; // Number of records per page
        let offset = 0; // Starting point

        let hasMoreRecords = true;

        while (hasMoreRecords) {
            let paginatedUrl = `${url}&limit=${limit}&offset=${offset}`;

            try {
                let response = await fetch(paginatedUrl);
                if (!response.ok) {
                    throw new Error('Failed to fetch data');
                }
                let data = await response.json();

                if (data.result.records.length > 0) {
                    arr = arr.concat(data.result.records);
                    console.log(offset);
                    offset += limit; // Move to the next set of records
                } else {
                    hasMoreRecords = false; // No more records to fetch
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                hasMoreRecords = false;
            }
        }

        console.log(arr.length);
        console.log(arr);
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
            .then(async data => {
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
                for (const school of schoolData) {
                    const coordinates = await getCoordinates(school.address);
                    if (coordinates) {
                        school.latitude = coordinates.latitude;
                        school.longitude = coordinates.longitude;
                    } else {
                        throw new Error('Unknown Error');
                    }
                }
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }



    // async function fetchAllCollections() {
    //     const batchSize = 10; // Adjust batch size as needed
    //     let collectionId = 1;
    //     let hasData = true;

    //     while (hasData) {
    //         let collectionPromises = [];

    //         for (let i = 0; i < batchSize; i++) {
    //             collectionPromises.push(fetchCollectionData(collectionId + i));
    //         }

    //         try {
    //             const collectionsData = await Promise.all(collectionPromises);
    //             hasData = false;

    //             collectionsData.forEach(data => {
    //                 if (data) {
    //                     HDBList.push(data);
    //                     hasData = true; // Set to true if at least one collection has data
    //                 }
    //             });

    //             collectionId += batchSize;
    //         } catch (error) {
    //             console.error('Error fetching collections:', error);
    //             break;
    //         }
    //     }

    //     console.log(HDBList);
    // }

    async function getCoordinates(address) {
        const url = `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${encodeURIComponent(address)}&returnGeom=Y&getAddrDetails=Y&pageNum=1`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const resultsDict = await response.json();
            // console.log(resultsDict);

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
        // await fetchAllCollections();
        await fetchAllRecords();
        await fetchSchoolData();
        HDBinfo = HDBOption(HDBList);
        await fetchMRTData();
        await fetchMallData();
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
            let key = `${item.flat_type} ${item.block} ${item.street_name}`;
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
            getListOfCoordinates(uniqueLocationList) {
                const listOfAddress = getListOfAddress(uniqueLocationList);
                let listOfCoordinates = [];

                for (const item of listOfAddress) {
                    listOfCoordinates.add(getCoordinates(item));
                }
                return listOfCoordinates;
            },
            getListOfDist(specifiedCoordList, amenityCoordList) {
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
    var form = document.querySelector("form");
    const MRTStationCheckbox = document.getElementById("MRTStationCheckbox");
    const MallCheckbox = document.getElementById("MallCheckbox");

    const Primary = document.getElementById("PrimaryCheckbox");
    const Secondary = document.getElementById("SecondaryCheckbox");
    const JuniorCollege = document.getElementById("JCCheckbox");



    const warningCard = document.getElementById("warningCard");

    /***********************************All Callbacks****************************************/
    form.addEventListener("submit", function (event) {
        console.log("Form.addEventListener");
        event.preventDefault();
        //Hides warning card if it was displayed
        warningCard.classList.add("d-none");

        let listOfSchool, listofpri, listofsec, listofjc, listOfMall, listOfMrt, combinedList;
        let locationInput = document.getElementById("location").value;
        //error handlingconsol
        //Correct
        console.log(locationInput)
        if (typeof locationInput === 'string') {
            locationInput = [locationInput];
        }

        let specifiedList = HDBinfo.getSpecifiedHDB(locationInput);

        let listOfSpecifiedCoord = HDBinfo.getListOfCoordinates(specifiedList);


        for (let i = 0; i < specifiedList; i++) {
            // did it like this so that if one of the check box wasnt ticked, the code would still display without issue
            combinedList.push([[specifiedList[i], listOfSpecifiedCoord[i]], [], [], [], [], []]);
        }

        if (MRTStationCheckbox.checked) {
            // MRT List
            // run the function to get mrt
            listOfMrt = HDBinfo.getListOfDist(listOfSpecifiedCoord, listOfMrt);
            //rmb to add the details
            for (let i = 0; i < specifiedList.length; i++) {
                combinedList[i][1].push(listOfMrt[i]);
            }

        }

        // Example: Check if Mall checkbox is checked
        if (MallCheckbox.checked) {
            // MALL LIST
            // run the function to get mall
            listOfMall = HDBinfo.getListOfDist(listOfSpecifiedCoord, listOfMall);
            for (let i = 0; i < specifiedList.length; i++) {
                combinedList[i][2].push(listOfMall[i]);
            }
        }

        // Example: Check if School checkbox is checked
        if (Primary.checked) {
            // SCHOOL LIST
            // CHECK FOR TYPE OF SCHOOL

            // run the function to get SCHOOL
            listOfSchool = HDBinfo.getListOfDist(listOfSpecifiedCoord, listOfSchool);
            listofpri = listOfSchool.filter(school => school.mainlevel_code == "PRIMARY")
            for (let i = 0; i < specifiedList.length; i++) {
                combinedList[i][3].push(listofpri[i]);
            }
        }

        if (Secondary.checked) {
            // SCHOOL LIST
            // CHECK FOR TYPE OF SCHOOL
            // run the function to get SCHOOL
            listOfSchool = HDBinfo.getListOfDist(listOfSpecifiedCoord, listOfSchool);
            listofsec = listOfSchool.filter(school => school.mainlevel_code == "SECONDARY")
            for (let i = 0; i < specifiedList.length; i++) {
                combinedList[i][4].push(listofsec[i]);
            }
        }

        if (JuniorCollege.checked) {
            // SCHOOL LIST
            // CHECK FOR TYPE OF SCHOOL
            // run the function to get SCHOOL
            listOfSchool = HDBinfo.getListOfDist(listOfSpecifiedCoord, listOfSchool);
            listofjc = listOfSchool.filter(school => school.mainlevel_code == "JUNIOR COLLEGE")
            for (let i = 0; i < specifiedList.length; i++) {
                combinedList[i][5].push(listofjc[i]);
            }
        }

        // [[[hdblist[i], hdbcoord[i]], [{latiude: 0, altidude: 0}, value: 10}], [{coords: [2, 2], value: 20}], [{coords: [3, 3], value: 30}]],[[hdblist[j]], [{coords: [4, 4], value: 5}], [{coords: [5, 5], value: 15}], [{coords: [6, 6], value: 25}]],...]
        for (let i = 0; i < specifiedList.length; i++) {
            combinedList.sort((a,b) => {
                const getValue = (subarray) => subarray.length > 0 ? subarray[1] : 0;

                // Calculate the sum of values for a and b
                let sumA = getValue(a[1]) + getValue(a[2]) + getValue(a[3]);
                let sumB = getValue(b[1]) + getValue(b[2]) + getValue(b[3]);
            

                return sumB - sumA;
            })
        }

        localStorage.setItem("combinedList", combinedList);
        localStorage.setItem("testing", "1");
        window.location.href = 'CardList.html';
    });



});
