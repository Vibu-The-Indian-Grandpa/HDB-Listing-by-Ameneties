
// import { initializeApp } from 'firebase/app';
// import { getDatabase, ref, get, child } from 'firebase/database';



import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, get, child } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

document.addEventListener("DOMContentLoaded", async function () {
    localStorage.clear();
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

    const app = initializeApp(firebaseConfig);
    const database = getDatabase(app);

    async function fetchMRTData() {
        const dbRef = ref(getDatabase());
        try {
            const snapshot = await get(child(dbRef, `MRT`));
            if (snapshot.exists()) {
                let transformedList = snapshot.val().map(item => ({
                    latitude: item.lat,
                    longitude: item.lng,
                    stationName: item.station_name,
                    type: item.type
                }));
                MRTList.push(...transformedList);
                console.log(MRTList)
            } else {
                console.log("No data available");
            }
        } catch (error) {
            console.error(error);
        }
        console.log("MRT Data fetched successfully");
    }

    async function fetchMallData() {
        const dbRef = ref(getDatabase());
        try {
            const snapshot = await get(child(dbRef, `Shopping Mall`));
            if (snapshot.exists()) {
                let transformedList = snapshot.val().map(item => ({
                    latitude: item.LATITUDE,
                    longitude: item.LONGITUDE,
                    mallName: item["Mall Name"],
                    type: item.type
                }));
                MallList.push(...transformedList);
            
            } else {
                console.log("No data available");
            }
        } catch (error) {
            console.error(error);
        }
        console.log(MallList[1])
        console.log("Mall Data fetched successfully");
    }

    let HDBinfo;
    const schoolData = [];
    let HDBList = [];
    const MRTList = [];
    const MallList = [];

    async function fetchAllRecords() {
        const datasetId = "d_8b84c4ee58e3cfc0ece0d773c8ca6abc";
        const url = "https://data.gov.sg/api/action/datastore_search?resource_id=" + datasetId;

        let limit = 1000;
        let offset = 0;
        let arr = [];
        let hasMoreRecords = true;

        while (offset < 1000) {
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
                    offset += limit;
                } else {
                    hasMoreRecords = false;
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                hasMoreRecords = false;
            }
        }
        HDBList.push(...arr);
        console.log("HDB Data fetched successfully");
        console.log(HDBList);
    }

    async function fetchSchoolData() {
        const datasetId = "d_688b934f82c1059ed0a6993d2a829089";
        const url = "https://data.gov.sg/api/action/datastore_search?resource_id=" + datasetId;
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch data');
                }
                return response.json();
            })
            .then(async data => {
                const records = data.result.records;
                records.forEach(record => {
                    schoolData.push({
                        school_name: record.school_name,
                        address: record.address,
                        postal_code: record.postal_code,
                        level: record.mainlevel_code
                    });
                });
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

    async function getCoordinates(address) {
        const url = `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${encodeURIComponent(address)}&returnGeom=Y&getAddrDetails=Y&pageNum=1`;
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const resultsDict = await response.json();
            if (resultsDict.results.length > 0) {
                return {
                    latitude: resultsDict.results[0].LATITUDE,
                    longitude: resultsDict.results[0].LONGITUDE
                };
            } else {
                return null;
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            return null;
        }
    }

    async function getAllData() {
        await fetchAllRecords();
        await fetchSchoolData();
        HDBinfo =await HDBOption(HDBList);
        await fetchMRTData();
        await fetchMallData();
    }

    function distanceCalculation(lo1, la1, lo2, la2, d2r) {
        const R = 6367;
        const dlong = d2r * (lo2 - lo1);
        const dlat = d2r * (la2 - la1);
        console.log(lo1)
        console.log(la1)
        console.log(lo2)
        console.log(la2)
        const a = Math.pow(Math.sin(dlat / 2), 2) +
            Math.cos(la1 * d2r) * Math.cos(la2 * d2r) *
            Math.pow(Math.sin(dlong / 2), 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const dist = R * c;
        console.log(dist)
        return dist;
    }

    function getTownByLocation(list, location) {
        return list.filter(item => item.town === location);
    }
    

    function getListOfAddress(data) {
        let listOfAddress = [];
        let list = data[0];
        console.log(list)
        for (const item of list) {
            listOfAddress.push(item.block + " " + item.street_name);
        }
        return listOfAddress;
    }

    function removeDuplicates(list) {
        let seen = new Set();
        return list.filter(item => {
            let key = `${item.block} ${item.street_name}`;
            if (!seen.has(key)) {
                seen.add(key);
                return true;
            }
            return false;
        });
    }

    async function HDBOption(data) {
        let LISTS = [...data];
        const D2R = Math.PI / 180;
        
        return {
            getSpecifiedHDB(data) {
                const specifiedLocations = data.map(location => getTownByLocation(LISTS, location));
                const uniqueLocationList = removeDuplicates(specifiedLocations);
                return uniqueLocationList;  // Return specified locations without removing duplicates
            },
            async getListOfCoordinates(uniqueLocationList) {
                const listOfAddress = getListOfAddress(uniqueLocationList);
                let listOfCoordinates = [];
            
                // Map each address to a promise of fetching coordinates asynchronously
                const promises = listOfAddress.map(async (item) => {
                    return await getCoordinates(item); // Await here to ensure it waits for each coordinate fetch
                });
            
                // Wait for all promises to resolve using Promise.all
                listOfCoordinates = await Promise.all(promises);
            
                return listOfCoordinates;
            },
            async getListOfDist(specifiedCoordList, amenityCoordList) {
                const D2R = Math.PI / 180;
                let arrayOfLeastDist = [];
            
                for (let i = 0; i < specifiedCoordList.length; i++) {
                    let leastDistance = Infinity;
                    let arrayOfamenityCoord = null;
            
                    for (let j = 0; j < amenityCoordList.length; j++) {
                        let tempDistance = distanceCalculation(
                            parseFloat(specifiedCoordList[i].latitude), parseFloat(specifiedCoordList[i].longitude),
                            amenityCoordList[j].latitude, amenityCoordList[j].longitude, D2R
                        );
            
                        console.log("Distance:", tempDistance);
            
                        if (tempDistance < leastDistance) {
                            leastDistance = tempDistance;
                            arrayOfamenityCoord = amenityCoordList[j];
                        }
                    }
            
                    arrayOfLeastDist.push([arrayOfamenityCoord, leastDistance]);
                }
            
                console.log("Array of Least Distance:", arrayOfLeastDist);
                return arrayOfLeastDist;
            }
            
        }
    }
    

    await getAllData();

    var form = document.querySelector("form");
    const MRTStationCheckbox = document.getElementById("MRTStationCheckbox");
    const MallCheckbox = document.getElementById("MallCheckbox");

    const Primary = document.getElementById("PrimaryCheckbox");
    const Secondary = document.getElementById("SecondaryCheckbox");
    const JuniorCollege = document.getElementById("JCCheckbox");

    const warningCard = document.getElementById("warningCard");

    form.addEventListener("submit",async function (event) {
        
        console.log("Form.addEventListener");
        event.preventDefault();
        // warningCard.classList.add("d-none");

        let listOfSchool = [], listofpri = [], listofsec = [], listofjc = [], listOfMall = [], listOfMrt = [], tempCoordList = [];
        var combinedList = [];
        let locationInput = document.getElementById("location").value;

        if (typeof locationInput === 'string') {
            locationInput = [locationInput];
        }

        let specifiedList = HDBinfo.getSpecifiedHDB(locationInput);
        let listOfSpecifiedCoord = await HDBinfo.getListOfCoordinates(specifiedList);
        
        console.log(listOfSpecifiedCoord);
        console.log("Hello")

        console.log(listOfSpecifiedCoord)
        console.log(specifiedList[0].length)
        for (let i = 0; i < specifiedList[0].length; i++) {
            tempCoordList = [specifiedList[0][i], listOfSpecifiedCoord[i]]
            console.log(tempCoordList);
            combinedList.push([tempCoordList, [], [], [], [], []]);
        }
        console.log(combinedList);
        if (MRTStationCheckbox.checked) {
            listOfMrt = await HDBinfo.getListOfDist(listOfSpecifiedCoord, MRTList);
            for (let i = 0; i < specifiedList[0].length; i++) {
                console.log(listOfMrt);
                combinedList[i][1].push(listOfMrt[i]);
            }
        }

        if (MallCheckbox.checked) {
            listOfMall = HDBinfo.getListOfDist(listOfSpecifiedCoord, MallList);
            for (let i = 0; i < specifiedList.length; i++) {
                combinedList[i][2].push(listOfMall[i]);
            }
        }

        if (Primary.checked) {
            listOfSchool = HDBinfo.getListOfDist(listOfSpecifiedCoord, schoolData);
            listofpri = listOfSchool.filter(school => school.level === "PRIMARY")
            for (let i = 0; i < specifiedList.length; i++) {
                combinedList[i][3].push(listofpri[i]);
            }
        }

        if (Secondary.checked) {
            listOfSchool = HDBinfo.getListOfDist(listOfSpecifiedCoord, schoolData);
            listofsec = listOfSchool.filter(school => school.level === "SECONDARY")
            for (let i = 0; i < specifiedList.length; i++) {
                combinedList[i][4].push(listofsec[i]);
            }
        }

        if (JuniorCollege.checked) {
            listOfSchool = HDBinfo.getListOfDist(listOfSpecifiedCoord, schoolData);
            listofjc = listOfSchool.filter(school => school.level === "JUNIOR COLLEGE")
            for (let i = 0; i < specifiedList.length; i++) {
                combinedList[i][5].push(listofjc[i]);
            }
        }

        combinedList.sort((a, b) => {
            const getValue = (subarray) => subarray.length > 0 ? subarray[1] : 0;

            let sumA = getValue(a[1]) + getValue(a[2]) + getValue(a[3]);
            let sumB = getValue(b[1]) + getValue(b[2]) + getValue(b[3]);

            return sumB - sumA;
        });
        console.log(combinedList);
        localStorage.setItem("combinedList", JSON.stringify(combinedList));
        window.location.href = 'CardList.html';
    });
});
