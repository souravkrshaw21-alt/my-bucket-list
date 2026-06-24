const goalInput = document.getElementById("goalInput");
const addBtn = document.getElementById("addBtn");
const goalList = document.getElementById("goalList");

const totalGoals = document.getElementById("totalGoals");
const completedGoals = document.getElementById("completedGoals");
const progressBar = document.getElementById("progressBar");
const emptyState = document.getElementById("emptyState");
const searchInput = document.getElementById("searchInput");
const categorySelect = document.getElementById("categorySelect");
const deadlineInput = document.getElementById("deadlineInput");
const datePlaceholder = document.querySelector(".date-placeholder");

let currentFilter = "all";
let goals = [];

addBtn.addEventListener("click", addGoal);

 searchInput.addEventListener(
    "input",
    renderGoals
);

document
.querySelectorAll(".filter-btn")
.forEach(button => {

    button.addEventListener(
        "click",
        function(){

            document
            .querySelectorAll(".filter-btn")
            .forEach(btn =>
                btn.classList.remove("active")
            );

            this.classList.add("active");

            currentFilter =
                this.dataset.filter;

            renderGoals();
        }
    );

});

goalInput.addEventListener("keypress", function(e){
    if(e.key === "Enter"){
        addGoal();
    }
});

function addGoal(){

    const text = goalInput.value.trim();
    const category = categorySelect.value;

    // Prevent adding if text is empty OR if no category is selected
    if(text === "" || category === ""){
        alert("Please enter a goal and select a category!");
        return;
    }

   const goal = {
        id: Date.now(),
        text: text,
        category: category,
        createdAt: new Date().toISOString(),
        deadline: deadlineInput.value,
        completed: false
    };
   
    goals.push(goal);

    saveGoals();

    // Reset the inputs back to their empty/placeholder states
    goalInput.value = "";
    deadlineInput.value = "";
    categorySelect.value = ""; // This resets the dropdown to the placeholder

    renderGoals();
}
function deleteGoal(id){

    goals = goals.filter(goal => goal.id !== id);

    saveGoals();

    renderGoals();
}

function toggleGoal(id){

    goals = goals.map(goal => {

        if(goal.id === id){
            goal.completed = !goal.completed;
        }

        return goal;
    });
    saveGoals();
    renderGoals();
}

function renderGoals(){

    goalList.innerHTML = "";

    if(goals.length === 0){
        emptyState.style.display = "block";
    }
    else{
        emptyState.style.display = "none";
    }

    const searchText =
    searchInput.value.toLowerCase();

goals
.filter(goal => {

    const matchesSearch =
        goal.text
        .toLowerCase()
        .includes(searchText);

    if(currentFilter === "completed"){
        return matchesSearch &&
               goal.completed;
    }

    if(currentFilter === "pending"){
        return matchesSearch &&
               !goal.completed;
    }

    return matchesSearch;
})
.forEach(goal => {
        const daysRemaining = getDaysRemaining(goal.deadline);
        const ringProgress = getCountdownProgress(goal);
        let countdownColor = "#22c55e";
        if(daysRemaining <= 7){countdownColor = "#f97316";}
        if(daysRemaining <= 3){countdownColor = "#ef4444";}

        const item = document.createElement("div");

        item.classList.add("goal-item");

        item.innerHTML = `
            <div class="goal-left">

                <input
                    type="checkbox"
                    ${goal.completed ? "checked" : ""}
                    onchange="toggleGoal(${goal.id})"
                >

                <div>

    <span class="goal-text ${goal.completed ? "completed" : ""}">
        ${goal.text}
    </span>

    <small class="category">
        ${goal.category}
    </small>

    <small>
        Added: ${goal.createdAt}
    </small>

</div>

            </div>

            <div class="goal-actions">

    <div
    class="countdown"
    style="border-color:${countdownColor};"
>

    <span class="days-number">
        ${daysRemaining !== null
            ? daysRemaining
            : "-"}
    </span>

    <span class="days-label">
        days
    </span>

</div>

    <button
        class="delete-btn"
        onclick="deleteGoal(${goal.id})"
    >
        🗑
    </button>

</div>
        `;

        goalList.appendChild(item);
    });

    updateStats();
}

function updateStats(){

    const total = goals.length;

    const completed = goals.filter(
        goal => goal.completed
    ).length;

    totalGoals.textContent = total;
    completedGoals.textContent = completed;

    const percentage =
        total === 0
        ? 0
        : (completed / total) * 100;

    progressBar.style.width = percentage + "%";

    progressText.textContent =
    `Progress: ${Math.round(percentage)}%`;
}

renderGoals();

function saveGoals(){
    localStorage.setItem(
        "bucketGoals",
        JSON.stringify(goals)
    );
}

function loadGoals(){

    const savedGoals =
        localStorage.getItem("bucketGoals");

    if(savedGoals){
        goals = JSON.parse(savedGoals);
    }

    renderGoals();
}

loadGoals();

function getDaysRemaining(deadline){

    if(!deadline){
        return null;
    }

    const today = new Date();

    today.setHours(0,0,0,0);

    const dueDate = new Date(deadline);

    const diff =
        dueDate - today;

    return Math.ceil(
        diff / (1000 * 60 * 60 * 24)
    );
}

function getCountdownProgress(goal){

    if(!goal.deadline){
        return 100;
    }

    const createdDate =
        new Date(goal.createdAt);

    const deadlineDate =
        new Date(goal.deadline);

    const today =
        new Date();

    const totalDuration =
        deadlineDate - createdDate;

    const elapsed =
        today - createdDate;

    if(totalDuration <= 0){
        return 0;
    }

    let percentage =
        100 - (
            (elapsed / totalDuration)
            * 100
        );

    percentage =
        Math.max(
            0,
            Math.min(100, percentage)
        );

    return percentage;
}

const editBtn = document.getElementById("editBtn");
let isEditMode = false;

editBtn.addEventListener("click", function() {
    isEditMode = !isEditMode;
    
    if (isEditMode) {
        // Switch to "Done" state
        this.textContent = "Done Editing";
        this.style.background = "#10b981"; // Turns green
        
        // Add the class that reveals the delete buttons via CSS
        goalList.classList.add("show-delete-mode");
    } else {
        // Revert back to "Edit" state
        this.textContent = "Edit List";
        this.style.background = "#f59e0b"; // Reverts to orange
        
        // Remove the class to hide the delete buttons
        goalList.classList.remove("show-delete-mode");
    }
});