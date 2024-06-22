        // Your Firebase Realtime Database URL
        const databaseURL = "https://hdbamenities-default-rtdb.asia-southeast1.firebasedatabase.app/";

        // Function to retrieve data
        async function fetchData() {
            try {
                const response = await fetch(`${databaseURL}/yourDataNode.json`);
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                const data = await response.json();
                document.getElementById('dataDisplay').innerText = JSON.stringify(data, null, 2);
            } catch (error) {
                console.error('Error fetching data:', error);
                document.getElementById('dataDisplay').innerText = 'Error fetching data';
            }
        }

        // Call the function to fetch data
        fetchData();