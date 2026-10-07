const API_BASE_URL = "http://localhost:5000/api";


// ========================================
// LOAD CUSTOMERS
// ========================================

async function loadCustomers() {

    const token = localStorage.getItem("token");

    if (!token) {
        alert("Please login first.");
        window.location.href = "login.html";
        return;
    }

    const customerSelect =
        document.getElementById("customerId");

    if (!customerSelect) {
        console.error("customerId select not found.");
        return;
    }

    try {

        const response = await fetch(
            `${API_BASE_URL}/customers`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Failed to load customers"
            );
        }

        customerSelect.innerHTML = `
            <option value="">
                Select Customer
            </option>
        `;

        data.forEach(customer => {

            const option =
                document.createElement("option");

            option.value = customer._id;

            option.textContent =
                `${customer.name} - ${customer.phone}`;

            customerSelect.appendChild(option);

        });

    } catch (error) {

        console.error(
            "Customer loading error:",
            error
        );

        customerSelect.innerHTML = `
            <option value="">
                Unable to load customers
            </option>
        `;

    }
}


// ========================================
// IMAGE PREVIEW
// ========================================

function setupImagePreview() {

    const imageInput =
        document.getElementById("repairImages");

    const preview =
        document.getElementById("imagePreview");

    if (!imageInput || !preview) {
        return;
    }

    imageInput.addEventListener(
        "change",
        function () {

            preview.innerHTML = "";

            const files =
                Array.from(this.files);

            files.forEach(file => {

                if (!file.type.startsWith("image/")) {
                    return;
                }

                const reader =
                    new FileReader();

                reader.onload = function (event) {

                    const image =
                        document.createElement("img");

                    image.src =
                        event.target.result;

                    image.style.width = "100px";
                    image.style.height = "100px";
                    image.style.objectFit = "cover";
                    image.style.borderRadius = "8px";
                    image.style.margin = "5px";
                    image.style.border = "1px solid #ddd";

                    preview.appendChild(image);

                };

                reader.readAsDataURL(file);

            });

        }
    );

}


// ========================================
// SUBMIT REPAIR
// ========================================

async function submitRepair(event) {

    event.preventDefault();

    const token =
        localStorage.getItem("token");

    if (!token) {

        alert("Please login first.");

        window.location.href =
            "login.html";

        return;

    }


    // ========================================
    // GET BASIC DEVICE INFORMATION
    // ========================================

    const customerId =
        document.getElementById("customerId").value;

    const deviceType =
        document.getElementById("deviceType").value;

    const brand =
        document.getElementById("brand").value.trim();

    const model =
        document.getElementById("model").value.trim();

    const serialNumber =
        document.getElementById("serialNumber").value.trim();

    const problem =
        document.getElementById("problem").value.trim();


    // ========================================
    // GET NEW REPAIR INFORMATION
    // ========================================

    const priority =
        document.getElementById("priority").value;

    const deviceCondition =
        document.getElementById("deviceCondition").value.trim();

    const estimatedCost =
        Number(
            document.getElementById("estimatedCost").value
        ) || 0;

    const amountPaid =
        Number(
            document.getElementById("amountPaid").value
        ) || 0;

    const expectedCompletionDate =
        document.getElementById(
            "expectedCompletionDate"
        ).value;

    const technicianName =
        document.getElementById(
            "technicianName"
        ).value.trim();

    const technicianNotes =
        document.getElementById(
            "technicianNotes"
        ).value.trim();

    const customerApproval =
        document.getElementById(
            "customerApproval"
        ).checked;


    // ========================================
    // VALIDATION
    // ========================================

    if (!customerId) {

        alert("Please select a customer.");

        return;

    }


    if (!deviceType) {

        alert("Please select the device type.");

        return;

    }


    if (!brand) {

        alert("Please enter the device brand.");

        return;

    }


    if (!model) {

        alert("Please enter the device model.");

        return;

    }


    if (!problem) {

        alert("Please describe the problem.");

        return;

    }


    if (estimatedCost < 0) {

        alert("Estimated repair cost cannot be negative.");

        return;

    }


    if (amountPaid < 0) {

        alert("Amount paid cannot be negative.");

        return;

    }


    if (amountPaid > estimatedCost && estimatedCost > 0) {

        alert(
            "Amount paid cannot be greater than the estimated repair cost."
        );

        return;

    }


    // ========================================
    // CREATE FORMDATA
    // ========================================

    const formData =
        new FormData();


    // Existing fields

    formData.append(
        "customerId",
        customerId
    );

    formData.append(
        "deviceType",
        deviceType
    );

    formData.append(
        "brand",
        brand
    );

    formData.append(
        "model",
        model
    );

    formData.append(
        "serialNumber",
        serialNumber
    );

    formData.append(
        "problem",
        problem
    );


    // New fields

    formData.append(
        "priority",
        priority
    );

    formData.append(
        "deviceCondition",
        deviceCondition
    );

    formData.append(
        "estimatedCost",
        estimatedCost
    );

    formData.append(
        "amountPaid",
        amountPaid
    );

    formData.append(
        "expectedCompletionDate",
        expectedCompletionDate
    );

    formData.append(
        "technicianName",
        technicianName
    );

    formData.append(
        "technicianNotes",
        technicianNotes
    );

    formData.append(
        "customerApproval",
        customerApproval
    );


    // ========================================
    // ADD IMAGES
    // ========================================

    const imageInput =
        document.getElementById(
            "repairImages"
        );

    if (
        imageInput &&
        imageInput.files.length
    ) {

        Array.from(
            imageInput.files
        ).forEach(file => {

            formData.append(
                "repairImages",
                file
            );

        });

    }


    // ========================================
    // SUBMIT
    // ========================================

    const submitButton =
        document.querySelector(
            "#repairForm button[type='submit']"
        );


    try {

        if (submitButton) {

            submitButton.disabled = true;

            submitButton.textContent =
                "Submitting Repair...";

        }


        const response =
            await fetch(
                `${API_BASE_URL}/repairs`,
                {
                    method: "POST",

                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    },

                    body: formData
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to submit repair"
            );

        }


        console.log(
            "Repair created:",
            data
        );


        alert(
            `✅ Repair request saved successfully.\n\nRepair Number: ${data.repairNumber || "Generated"}`
        );


        // ========================================
        // RESET FORM
        // ========================================

        const repairForm =
            document.getElementById(
                "repairForm"
            );

        if (repairForm) {
            repairForm.reset();
        }


        const preview =
            document.getElementById(
                "imagePreview"
            );

        if (preview) {
            preview.innerHTML = "";
        }


        // Reload customers

        await loadCustomers();


    } catch (error) {

        console.error(
            "Repair submission error:",
            error
        );

        alert(
            `❌ ${error.message}`
        );

    } finally {

        if (submitButton) {

            submitButton.disabled = false;

            submitButton.textContent =
                "Submit Repair Request";

        }

    }

}


// ========================================
// INITIALIZE
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadCustomers();

        setupImagePreview();


        const repairForm =
            document.getElementById(
                "repairForm"
            );


        if (repairForm) {

            repairForm.addEventListener(
                "submit",
                submitRepair
            );

        }

    }
);