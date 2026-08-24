const points = document.querySelectorAll(".point");
const tooltip = document.getElementById("tooltip");

points.forEach(point => {

    point.addEventListener("mouseenter", () => {

        const name = point.dataset.name;
        const power = point.dataset.power;
        const interest = point.dataset.interest;

        tooltip.innerHTML = `
            <div style="font-size:18px; margin-bottom:8px;">
                <strong>${point.querySelector("text").textContent}</strong>
            </div>

            <div style="margin-bottom:10px;">
                ${name}
            </div>

            <div>
                <strong>Poder:</strong> ${power}/5
            </div>

            <div>
                <strong>Interés:</strong> ${interest}/5
            </div>
        `;

        tooltip.style.display = "block";
    });


    point.addEventListener("mousemove", (event) => {

        tooltip.style.left = (event.clientX + 15) + "px";
        tooltip.style.top = (event.clientY + 15) + "px";

    });


    point.addEventListener("mouseleave", () => {

        tooltip.style.display = "none";

    });

});
