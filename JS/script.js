// Function to create an HTML element with attributes and text content
function createElement(tagName, attributes, textContent = "") {
  const element = document.createElement(tagName);
  for (let attribute in attributes) {
    element.setAttribute(attribute, attributes[attribute]);
  }
  element.textContent = textContent;
  return element;
}

// API URL
const API_URL =
  "https://6730a73366e42ceaf160f5c4.mockapi.io/monthly-income-expense";
window.onload = () => {
  // Function to fetch data from the mock API, display it in the table, and update totals
  async function fetchAndDisplay(element, filterType = "All") {
    try {
      element.innerHTML = ""; // Clear previous content

      const res = await fetch(API_URL);
      const datas = await res.json();

      // Filter data based on the selected filter type
      const filteredData =
        filterType === "All"
          ? datas
          : datas.filter((data) => data.type === filterType);

      // Populate the table with filtered data
      filteredData.forEach((data) => {
        const dataRow = element.appendChild(
          createElement("tr", { class: "border-2 bg-white font-serif text-lg" })
        );

        dataRow.appendChild(
          createElement("td", { class: "p-4 " }, data.description)
        );
        dataRow.appendChild(createElement("td", { class: "p-4" }, data.amount));
        dataRow.appendChild(createElement("td", { class: "p-4" }, data.type));

        // Action cell with edit and delete buttons
        const actionCell = dataRow.appendChild(
          createElement("td", { class: "p-4 space-x-4 actioncell" })
        );

        // Edit button
        const editButton = actionCell.appendChild(
          createElement(
            "button",
            {
              class:
                "text-blue-500 hover:text-blue-700 hover:underline editButton",
            },
            "Edit"
          )
        );



        // Edit button functionality
        editButton.addEventListener("click", () => {
          // Set current editing ID
          currentEditId = data.id;

          // Populate input fields with selected data
          desData.value = data.description;
          amtData.value = data.amount;
          if (data.type === "Income") {
            incomeBtn.checked = true;
          } else if (data.type === "Expense") {
            expenseBtn.checked = true;
          }
        });



        // Delete button
        const deleteButton = actionCell.appendChild(
          createElement(
            "button",
            {
              class: "text-red-500 hover:text-red-700 hover:underline",
            },
            "Delete"
          )
        );

        // Delete button functionality
        deleteButton.addEventListener("click", async () => {
          try {
            // Send DELETE request to mock API
            await fetch(`${API_URL}/${data.id}`, {
              method: "DELETE",
            });
            // Refresh the display after deletion
            fetchAndDisplay(element, filterType);
            calculateTotals(datas); // Update totals
          } catch (error) {
            console.warn("Error deleting data:", error);
          }
        });
      });

      // Update totals after fetching data
      calculateTotals(datas);
    } catch (error) {
      alert("Error fetching data");
    }
  }

  // Function to calculate totals for income, expense, and net balance
  function calculateTotals(data) {
    let totalIncome = 0;
    let totalExpense = 0;

    // Sum income and expense based on data type
    data.forEach((item) => {
      if (item.type === "Income") {
        totalIncome += parseFloat(item.amount);
      } else if (item.type === "Expense") {
        totalExpense += parseFloat(item.amount);
      }
    });

    const netBalance = totalIncome - totalExpense;

    // Update the UI
    document.getElementById(
      "totalIncome"
    ).textContent = `Income: ₹${totalIncome}`;
    document.getElementById(
      "totalExpense"
    ).textContent = `Expense: ₹${totalExpense}`;
    document.getElementById(
      "netBalance"
    ).textContent = `Net Balance: ₹${netBalance}`;
  }

  // Function to save edited data
  async function saveEdit() {
    // Check if there is an item being edited
    if (currentEditId === null) return;

    // Get updated values from the input fields
    const updatedDescription = desData.value;
    const updatedAmount = amtData.value;
    const updatedType = incomeBtn.checked ? "Income" : "Expense";

    // Prepare the updated data
    const updatedData = {
      description: updatedDescription,
      amount: updatedAmount,
      type: updatedType,
    };

    try {
      // Send PUT request to update the data on the mock API
      await fetch(`${API_URL}/${currentEditId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      // Clear editing state
      currentEditId = null;

      // Refresh the display after saving
      fetchAndDisplay(document.getElementById("datas"), "All");
      calculateTotals(await (await fetch(API_URL)).json());
    } catch (error) {
      console.warn("Error updating data:", error);
    } finally {
      // Clear input fields
      desData.value = "";
      amtData.value = "";
      incomeBtn.checked = false;
      expenseBtn.checked = false;
    }
  }

  document.body.appendChild(
    createElement("nav", { class: " title" }, "INCOME EXPENSE TRACKER")
  );

  // Main div for showing totals
  const mainDiv = document.body.appendChild(
    createElement("div", {
      class: "bg-neutral-100 flex justify-around py-10 mx-auto",
    })
  );

  // Div for total income
  const incomeDiv = mainDiv.appendChild(
    createElement("div", { id: "totalIncome", class: "" }, "Income: ₹0")
  );

  // Div for total expense
  const expenseDiv = mainDiv.appendChild(
    createElement("div", { id: "totalExpense", class: "" }, "Expense: ₹0")
  );

  // Div for net balance
  const netBalanceDiv = mainDiv.appendChild(
    createElement("div", { id: "netBalance", class: "" }, "Net Balance: ₹0")
  );

  const secondDiv = document.body.appendChild(
    createElement("div", {
      class: "bg-neutral-100 flex justify-around py-10 ",
    })
  );
  // Div for newdata entry
  const newDataDiv = secondDiv.appendChild(
    createElement("div", { class: " newDataDiv" })
  );

  newDataDiv.appendChild(
    createElement(
      "p",
      { class: "font-bold text-white text-xl font-serif tracking-wider" },
      "ADD NEW DATA"
    )
  );

  const content = newDataDiv.appendChild(
    createElement("div", {
      class: "flex flex-row gap-4 align-center items-center content",
    })
  );

  const descrip = content.appendChild(
    createElement("div", {
      class: "flex flex-col text-white text-xl font-serif gap-y-4 ",
    })
  );
  descrip.appendChild(createElement("p", {}, "Description :"));

  const desData = descrip.appendChild(
    createElement("input", {
      class: "border-2 px-4 py-2  rounded-lg text-black desData",
      placeholder: "Description",
      type: "text",
    })
  );

  const amount = content.appendChild(
    createElement("div", {
      class: "flex flex-col text-white text-xl font-serif gap-y-4",
    })
  );
  amount.appendChild(createElement("p", {}, "Amount :"));

  const amtData = amount.appendChild(
    createElement("input", {
      class: "border-2 px-4 py-2  rounded-lg text-black amtData",
      placeholder: "Amount",
      type: "Number",
    })
  );

  const typeDiv = content.appendChild(
    createElement("div", {
      class: "flex flex-col text-white text-xl font-serif gap-y-4",
    })
  );
  typeDiv.appendChild(createElement("p", {}, "Type :"));
  typeDiv.appendChild(document.getElementById("radioGroup"));
  const incomeBtn = document.getElementById("income");
  const expenseBtn = document.getElementById("expense");

  let selectedType = "";

  const addDataBtn = newDataDiv.appendChild(
    createElement(
      "button",
      {
        class:
          "border-2 bg-green-500 py-2 hover:bg-green-600 active:bg-green-500 rounded-lg hover:ring-green-600 hover:ring-2 text-white text-xl font-bold",
        type: "button",
      },
      "ADD DATA"
    )
  );
  // Function that should be executed when we click add data button
  addDataBtn.addEventListener("click", () => {
    async function addData() {
      if (incomeBtn.checked) {
        selectedType = "Income";
      } else if (expenseBtn.checked) {
        selectedType = "Expense";
      }

      if (desData.value == "" || amtData.value == "" || selectedType == "") {
        alert("Please fill all the data");
        return;
      }
      const newData = {
        description: desData.value,
        amount: amtData.value,
        type: selectedType,
      };
      console.log(newData);
      try {
        const res = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newData),
        });
        const data = await res.json();
        fetchAndDisplay(document.getElementById("datas"), filterSelect.value);
      } catch (error) {
        console.warn(error);
      } finally {
        desData.value = "";
        amtData.value = "";
        selectedType = "";
      }
    }
    if (currentEditId === null) {
      addData(); // Call addData function if not editing
    } else {
      saveEdit(); // Call saveEdit function if editing
    }
  });

  const thirdDiv = document.body.appendChild(
    createElement("div", {
      class: "h-24 bg-neutral-100 flex py-10  thirdDiv",
    })
  );

  // Radio Buttons for Filtering
  const allFilter = thirdDiv.appendChild(
    createElement("input", {
      type: "radio",
      id: "allFilter",
      name: "filter",
      value: "All",
    })
  );

  // Function for flitering data in table based on type (all)
  allFilter.addEventListener("change", () =>
    fetchAndDisplay(document.getElementById("datas"), "All")
  );
  thirdDiv.appendChild(
    createElement(
      "label",
      { for: "allFilter", class: "text-blue-500 font-bold font-serif text-lg" },
      "All"
    )
  );

  const incomeFilter = thirdDiv.appendChild(
    createElement("input", {
      type: "radio",
      id: "incomeFilter",
      name: "filter",
      value: "Income",
    })
  );

  // Function for flitering data in table based on type (Income)
  incomeFilter.addEventListener("change", () =>
    fetchAndDisplay(document.getElementById("datas"), "Income")
  );
  thirdDiv.appendChild(
    createElement(
      "label",
      {
        for: "incomeFilter",
        class: "text-green-500 font-bold font-serif text-lg",
      },
      "Income"
    )
  );

  const expenseFilter = thirdDiv.appendChild(
    createElement("input", {
      type: "radio",
      id: "expenseFilter",
      name: "filter",
      value: "Expense",
    })
  );

  // Function for flitering data in table based on type (Expense)
  expenseFilter.addEventListener("change", () =>
    fetchAndDisplay(document.getElementById("datas"), "Expense")
  );
  thirdDiv.appendChild(
    createElement(
      "label",
      {
        for: "expenseFilter",
        class: "text-red-500 font-bold font-serif text-lg",
      },
      "Expense"
    )
  );
  //  main Div to append table
  const forthDiv = document.body.appendChild(
    createElement("div", {
      class: "bg-neutral-100 flex justify-around ",
    })
  );

  const tableContainer = forthDiv.appendChild(
    createElement("div", {
      class: "mx-auto container py-5 drop-shadow-xl rounded-lg",
    })
  );
  const table = tableContainer.appendChild(
    createElement("table", { class: "w-full text-left " })
  );
  const thead = table.appendChild(createElement("thead", { class: " thead" }));
  const theadRow = thead.appendChild(createElement("tr"));
  theadRow.appendChild(createElement("th", { class: "p-4" }, "Description"));
  theadRow.appendChild(createElement("th", { class: "p-4" }, "Amount"));
  theadRow.appendChild(createElement("th", { class: "p-4" }, "Type"));
  theadRow.appendChild(createElement("th", { class: "p-4" }, "Action"));
  const tbody = table.appendChild(
    createElement("tbody", { id: "datas", class: "" })
  );

  // Initial display of all data
  fetchAndDisplay(tbody, "All");
};
