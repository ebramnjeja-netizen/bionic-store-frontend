const API_URL = "/api/expenses";


// ========================================
// LOAD EXPENSES
// ========================================

async function loadExpenses() {

    const expenseList =
        document.getElementById("expenseList");

    try {

        const response =
            await fetch(API_URL);

        const expenses =
            await response.json();

        if (!response.ok) {

            throw new Error(
                "Failed to load expenses."
            );

        }

        displayExpenses(expenses);

    } catch (error) {

        console.error(
            "Expenses error:",
            error
        );

        expenseList.innerHTML =
            `<p>❌ ${error.message}</p>`;

    }

}


// ========================================
// DISPLAY EXPENSES
// ========================================

function displayExpenses(expenses) {

    const expenseList =
        document.getElementById("expenseList");

    const totalElement =
        document.getElementById("totalExpenses");


    if (!expenses.length) {

        expenseList.innerHTML =
            "<p>No shop expenses yet.</p>";

        totalElement.textContent =
            "TZS 0";

        return;

    }


    let total = 0;


    expenseList.innerHTML =
        expenses.map(expense => {

            total +=
                Number(expense.amount || 0);


            const date =
                expense.expenseDate
                    ? new Date(
                        expense.expenseDate
                    ).toLocaleDateString()
                    : "-";


            return `

                <div class="expense-row">

                    <div>

                        <strong>
                            ${expense.description}
                        </strong>

                        <div>
                            ${expense.category}
                        </div>

                        <small>
                            ${date}
                        </small>

                        ${
                            expense.notes
                                ? `<p>${expense.notes}</p>`
                                : ""
                        }

                    </div>


                    <div>

                        <strong>
                            TZS ${Number(
                                expense.amount
                            ).toLocaleString()}
                        </strong>


                        <button
                            onclick="deleteExpense('${expense._id}')">

                            🗑️

                        </button>

                    </div>

                </div>

            `;

        }).join("");


    totalElement.textContent =
        "TZS " +
        total.toLocaleString();

}


// ========================================
// ADD EXPENSE
// ========================================

document
    .getElementById("expenseForm")
    .addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const description =
                document.getElementById(
                    "description"
                ).value.trim();


            const category =
                document.getElementById(
                    "category"
                ).value;


            const amount =
                document.getElementById(
                    "amount"
                ).value;


            const expenseDate =
                document.getElementById(
                    "expenseDate"
                ).value;


            const notes =
                document.getElementById(
                    "notes"
                ).value.trim();


            try {

                const response =
                    await fetch(
                        API_URL,
                        {

                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                description,

                                category,

                                amount,

                                expenseDate,

                                notes

                            })

                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Failed to create expense."
                    );

                }


                alert(
                    "✅ Expense saved successfully!"
                );


                document
                    .getElementById(
                        "expenseForm"
                    )
                    .reset();


                loadExpenses();


            } catch (error) {

                console.error(
                    "Create expense error:",
                    error
                );

                alert(
                    "❌ " +
                    error.message
                );

            }

        }
    );


// ========================================
// DELETE EXPENSE
// ========================================

async function deleteExpense(id) {

    if (
        !confirm(
            "Delete this expense?"
        )
    ) {

        return;

    }


    try {

        const response =
            await fetch(
                `${API_URL}/${id}`,
                {
                    method: "DELETE"
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to delete expense."
            );

        }


        alert(
            "✅ Expense deleted."
        );


        loadExpenses();


    } catch (error) {

        console.error(
            "Delete expense error:",
            error
        );

        alert(
            "❌ " +
            error.message
        );

    }

}


// ========================================
// START
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    loadExpenses
);