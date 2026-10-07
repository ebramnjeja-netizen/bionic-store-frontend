let expensesData = [];


/*
====================================================
LOAD EXPENSES
====================================================
*/

async function loadExpenses() {

    try {

        const response =
            await fetch(
                "/api/wifi-expenses"
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load expenses."
            );

        }


        expensesData =
            Array.isArray(data)
                ? data
                : [];


        renderExpenses();

        updateExpenseSummary();


    } catch (error) {

        console.error(
            "Load expenses error:",
            error
        );

        showExpenseMessage(
            "❌ " + error.message
        );

    }

}


/*
====================================================
RENDER EXPENSES
====================================================
*/

function renderExpenses() {

    const tableBody =
        document.getElementById(
            "expenseTableBody"
        );


    if (!tableBody) {
        return;
    }


    if (expensesData.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="6">
                    No Wi-Fi expenses recorded.
                </td>
            </tr>
        `;

        return;

    }


    tableBody.innerHTML =
        expensesData.map(
            expense => {

                const date =
                    expense.expenseDate
                        ? new Date(
                            expense.expenseDate
                        ).toLocaleDateString()
                        : "-";


                return `

                    <tr>

                        <td>
                            ${date}
                        </td>

                        <td>
                            ${escapeExpenseHtml(
                                expense.description
                            )}
                        </td>

                        <td>
                            ${escapeExpenseHtml(
                                expense.category
                            )}
                        </td>

                        <td>
                            TZS ${Number(
                                expense.amount || 0
                            ).toLocaleString()}
                        </td>

                        <td>
                            ${escapeExpenseHtml(
                                expense.notes || "-"
                            )}
                        </td>

                        <td>

                            <button
                                class="delete-expense"
                                onclick="deleteExpense('${expense._id}')">

                                🗑️ Delete

                            </button>

                        </td>

                    </tr>

                `;

            }
        ).join("");

}


/*
====================================================
ADD EXPENSE
====================================================
*/

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const form =
            document.getElementById(
                "expenseForm"
            );


        if (!form) {
            return;
        }


        form.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                try {

                    const payload = {

                        description:
                            document.getElementById(
                                "expenseDescription"
                            ).value.trim(),

                        category:
                            document.getElementById(
                                "expenseCategory"
                            ).value,

                        amount:
                            Number(
                                document.getElementById(
                                    "expenseAmount"
                                ).value
                            ),

                        expenseDate:
                            document.getElementById(
                                "expenseDate"
                            ).value || null,

                        notes:
                            document.getElementById(
                                "expenseNotes"
                            ).value.trim()

                    };


                    const response =
                        await fetch(
                            "/api/wifi-expenses",
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify(
                                        payload
                                    )
                            }
                        );


                    const data =
                        await response.json();


                    if (!response.ok) {

                        throw new Error(
                            data.message ||
                            "Failed to save expense."
                        );

                    }


                    showExpenseMessage(
                        "✅ Expense saved successfully."
                    );


                    form.reset();


                    await loadExpenses();


                } catch (error) {

                    console.error(
                        "Create expense error:",
                        error
                    );


                    showExpenseMessage(
                        "❌ " + error.message
                    );

                }

            }
        );

    }
);


/*
====================================================
DELETE EXPENSE
====================================================
*/

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
                `/api/wifi-expenses/${id}`,
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


        showExpenseMessage(
            "✅ Expense deleted."
        );


        await loadExpenses();


    } catch (error) {

        console.error(
            "Delete expense error:",
            error
        );


        showExpenseMessage(
            "❌ " + error.message
        );

    }

}


/*
====================================================
SUMMARY
====================================================
*/

function updateExpenseSummary() {

    const total =
        expensesData.reduce(
            (sum, expense) =>
                sum +
                Number(
                    expense.amount || 0
                ),
            0
        );


    const totalElement =
        document.getElementById(
            "totalExpenses"
        );


    const countElement =
        document.getElementById(
            "expenseCount"
        );


    if (totalElement) {

        totalElement.textContent =
            "TZS " +
            total.toLocaleString();

    }


    if (countElement) {

        countElement.textContent =
            expensesData.length;

    }

}


/*
====================================================
MESSAGE
====================================================
*/

function showExpenseMessage(message) {

    const element =
        document.getElementById(
            "expenseMessage"
        );


    if (!element) {
        return;
    }


    element.textContent =
        message;


    setTimeout(
        () => {

            element.textContent =
                "";

        },
        4000
    );

}


/*
====================================================
HTML SAFETY
====================================================
*/

function escapeExpenseHtml(value) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/*
====================================================
INITIAL LOAD
====================================================
*/

document.addEventListener(
    "DOMContentLoaded",
    loadExpenses
);