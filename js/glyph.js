// Charger les données depuis le fichier CSV
d3.csv('../data/data.csv').then(function (data) {
            
    data.forEach(function (d) {
        d.Date = d3.timeParse("%d-%m-%Y")(d.Date);
        d['Daily Killed Persons'] = +d['Daily Killed Persons'];
        d['Daily Injured Persons'] = +d['Daily Injured Persons'];
    });

    // Configuration du graphique
    const margin = { top:50, right: 215, bottom: 50, left: 80 };
    const width = window.innerWidth - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    // Créer l'échelle pour l'axe des X (dates)
    const xScale = d3.scaleTime()
        .domain(d3.extent(data, d => d.Date))
        .range([0, width]);

    // Créer l'échelle pour l'axe des Y (nombre de personnes)
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => Math.max(d['Daily Killed Persons'], d['Daily Injured Persons']))])
        .range([height, 0]);

    // Créer les lignes pour les deux catégories
    const lineKilled = d3.line()
        .x(d => xScale(d.Date))
        .y(d => yScale(d['Daily Killed Persons']));

    const lineInjured = d3.line()
        .x(d => xScale(d.Date))
        .y(d => yScale(d['Daily Injured Persons']));

    // Créer le graphique
    const svg = d3.select("#line-chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Ajouter les lignes au graphique
    svg.append("path")
        .data([data])
        .attr("class", "line")
        .attr("d", lineKilled)
        .style("stroke", "red")
        .style("stroke-width", 1.5)
        .style("fill", "none");

    svg.append("path")
        .data([data])
        .attr("class", "line")
        .attr("d", lineInjured)
        .style("stroke", "blue")
        .style("stroke-width", 1.5)
        .style("fill", "none");

    // Ajouter les axes
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale));

    svg.append("g")
        .call(d3.axisLeft(yScale));


    // Ajouter les titres des axes
    svg.append("text")
        .attr("transform", `translate(${width / 2},${height + margin.top})`)
        .style("text-anchor", "middle")
        .text("Date");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 5 - margin.left)
        .attr("x", 0 - height / 2)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Number of persons");


    // Ajouter un titre au graphique
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -margin.top/1.5)
        .attr("text-anchor", "middle")
        .style("font-size", "17px")
        .style("font-weight", "bold")
        .style("font-style", "italic")
        .text("Multi-line chart: Impact of the last genocide in Gaza – Daily counts of killed and injured citizens");


    // Ajouter la légende en haut à droite du graphique
    const legend = svg.append("g")
        .attr("transform", `translate(${width - 40},${margin.top/2})`);

    legend.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", 50)
        .attr("y2", 0)
        .style("stroke", "red")
        .style("stroke-width", 2);

    legend.append("text")
        .attr("x", 60)
        .attr("y", 0)
        .attr("dy", "0.35em")
        .style("fill", "red")
        .text("Killed Persons");

    legend.append("line")
        .attr("x1", 0)
        .attr("y1", 20)
        .attr("x2", 50)
        .attr("y2", 20)
        .style("stroke", "blue")
        .style("stroke-width", 2);

    legend.append("text")
        .attr("x", 60)
        .attr("y", 20)
        .attr("dy", "0.35em")
        .style("fill", "blue")
        .text("Injured Persons");
    

    // Ajouter le cercle interactif et le texte pour "Daily Killed Persons"
    const focusKilled = svg.append("g")
        .attr("class", "focus focus-killed")
        .style("display", "none");

    focusKilled.append("circle")
        .attr("r", 8.5)
        .style("fill", "none")
        .style("stroke", "red");

    focusKilled.append("text")
        .attr("x", 9)
        .attr("dy", "0.2em")
        .style("fill", "black")
        .style("font-weight", "bold"); 

    // Ajouter le cercle interactif et le texte pour "Daily Injured Persons"
    const focusInjured = svg.append("g")
        .attr("class", "focus focus-injured")
        .style("display", "none");

    focusInjured.append("circle")
        .attr("r", 8.5)
        .style("fill", "none")
        .style("stroke", "blue");

    focusInjured.append("text")
        .attr("x", 9)
        .attr("dy", "-0.7em")
        .style("fill", "black")
        .style("font-weight", "bold"); 

    // Ajouter un rectangle pour contenir l'information à afficher
    svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .style("opacity", 0)
        .on("mouseover", mouseover)
        .on("mouseout", mouseout)
        .on("mousemove", mousemove);

    // Les interactions
    function mouseover() {
        focusKilled.style("display", null);
        focusInjured.style("display", null);
    }

    function mousemove(event) {
        const x0 = xScale.invert(d3.pointer(event)[0]);
        const i = d3.bisect(data.map(d => d.Date), x0, 1);
        const selectedData = data[i - 1];

        // Pour "Daily Killed Persons"
        focusKilled.attr("transform", `translate(${xScale(selectedData.Date)},${yScale(selectedData['Daily Killed Persons'])})`);
        focusKilled.select("text").text(`Date : ${selectedData.Date.toLocaleDateString()} - Killed : ${selectedData['Daily Killed Persons']}`);

        // Pour "Daily Injured Persons"
        focusInjured.attr("transform", `translate(${xScale(selectedData.Date)},${yScale(selectedData['Daily Injured Persons'])})`);
        focusInjured.select("text").text(`Date : ${selectedData.Date.toLocaleDateString()} - Injured : ${selectedData['Daily Injured Persons']}`);
    }

    function mouseout() {
        focusKilled.style("display", "none");
        focusInjured.style("display", "none");
    }

});