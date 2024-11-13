// script8.js
// Create tooltip div
const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

function showTooltip(event, text) {
    tooltip.transition()
        .duration(200)
        .style("opacity", .9);
    tooltip.html(text)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
}

function hideTooltip() {
    tooltip.transition()
        .duration(500)
        .style("opacity", 0);
}

// Load and process data
d3.csv("forest-cover-v1.csv").then(function(data) {
    // Data processing
    data.forEach(d => {
        d.Population = +d["Population"];
        d.Area = +d["Area (kmÂ²)"];
        d.Density = +d["Density (per kmÂ²)"];
        // Create array for timeline data
        const years = Array.from({length: 31}, (_, i) => 1990 + i);
        d.forestHistory = years.map(year => ({
            year: year,
            value: +d[`Forest Area ${year}`]
        })).filter(item => !isNaN(item.value));
    });

    createBarChart(data);
    createPieChart(data);
    createScatterPlot(data);
    createHistogram(data);
    createBoxPlot(data);
    createTimelineChart(data);
});

function createBarChart(data) {
    const margin = {top: 30, right: 30, bottom: 70, left: 60},
        width = 460 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    const svg = d3.select("#barChart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Get top 10 countries by forest area in 2020
    const top10 = data.sort((a, b) => b.forestHistory[b.forestHistory.length-1].value - 
                                    a.forestHistory[a.forestHistory.length-1].value)
                    .slice(0, 10);

    const x = d3.scaleBand()
        .range([0, width])
        .domain(top10.map(d => d["Country Name"]))
        .padding(0.2);

    const y = d3.scaleLinear()
        .domain([0, 100])
        .range([height, 0]);

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

    svg.append("g")
        .call(d3.axisLeft(y));

    svg.selectAll("bars")
        .data(top10)
        .join("rect")
        .attr("x", d => x(d["Country Name"]))
        .attr("y", d => y(d.forestHistory[d.forestHistory.length-1].value))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d.forestHistory[d.forestHistory.length-1].value))
        .attr("fill", "#69b3a2")
        .on("mouseover", function(event, d) {
            showTooltip(event, `${d["Country Name"]}: ${d.forestHistory[d.forestHistory.length-1].value.toFixed(1)}%`);
        })
        .on("mouseout", hideTooltip);

    // Add title
    svg.append("text")
        .attr("x", width/2)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .text("Top 10 Countries by Forest Area (2020)");
}

function createPieChart(data) {
    const width = 460,
        height = 400,
        margin = 40;
    
    const radius = Math.min(width, height) / 2 - margin;

    const svg = d3.select("#pieChart")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width/2},${height/2})`);

    // Aggregate data by continent
    const continentData = d3.group(data, d => d.Continent);
    const continentSums = Array.from(continentData, ([key, value]) => ({
        continent: key,
        forestArea: d3.mean(value, d => d.forestHistory[d.forestHistory.length-1].value)
    }));

    const color = d3.scaleOrdinal()
        .domain(continentSums.map(d => d.continent))
        .range(d3.schemeSet2);

    const pie = d3.pie()
        .value(d => d.forestArea);

    const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius);

    const arcs = svg.selectAll("arc")
        .data(pie(continentSums))
        .enter()
        .append("g");

    arcs.append("path")
        .attr("d", arc)
        .attr("fill", d => color(d.data.continent))
        .attr("stroke", "white")
        .style("stroke-width", "2px")
        .on("mouseover", function(event, d) {
            showTooltip(event, `${d.data.continent}: ${d.data.forestArea.toFixed(1)}%`);
        })
        .on("mouseout", hideTooltip);

    // Add title
    svg.append("text")
        .attr("x", 0)
        .attr("y", -height/2 + 20)
        .attr("text-anchor", "middle")
        .text("Average Forest Area by Continent");
}

function createScatterPlot(data) {
    const margin = {top: 30, right: 30, bottom: 60, left: 60},
        width = 460 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    const svg = d3.select("#scatterPlot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.Density)])
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([0, 100])
        .range([height, 0]);

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

    svg.append("g")
        .call(d3.axisLeft(y));

    svg.append("g")
        .selectAll("dot")
        .data(data)
        .join("circle")
        .attr("cx", d => x(d.Density))
        .attr("cy", d => y(d.forestHistory[d.forestHistory.length-1].value))
        .attr("r", 5)
        .style("fill", "#69b3a2")
        .on("mouseover", function(event, d) {
            showTooltip(event, `${d["Country Name"]}\nDensity: ${d.Density.toFixed(1)}\nForest: ${d.forestHistory[d.forestHistory.length-1].value.toFixed(1)}%`);
        })
        .on("mouseout", hideTooltip);

    // Add labels
    svg.append("text")
        .attr("x", width/2)
        .attr("y", height + margin.bottom - 10)
        .attr("text-anchor", "middle")
        .text("Population Density (per km²)");

    svg.append("text")
        .attr("x", -height/2)
        .attr("y", -margin.left + 20)
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .text("Forest Area (%)");
}

function createHistogram(data) {
    const margin = {top: 30, right: 30, bottom: 30, left: 60},
        width = 460 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    const svg = d3.select("#histogram")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const forestValues = data.map(d => d.forestHistory[d.forestHistory.length-1].value);

    const x = d3.scaleLinear()
        .domain([0, 100])
        .range([0, width]);

    const histogram = d3.histogram()
        .value(d => d)
        .domain(x.domain())
        .thresholds(x.ticks(20));

    const bins = histogram(forestValues);

    const y = d3.scaleLinear()
        .range([height, 0])
        .domain([0, d3.max(bins, d => d.length)]);

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

    svg.append("g")
        .call(d3.axisLeft(y));

    svg.selectAll("rect")
        .data(bins)
        .join("rect")
        .attr("x", 1)
        .attr("transform", d => `translate(${x(d.x0)},${y(d.length)})`)
        .attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - 1))
        .attr("height", d => height - y(d.length))
        .style("fill", "#69b3a2")
        .on("mouseover", function(event, d) {
            showTooltip(event, `Range: ${d.x0.toFixed(1)}-${d.x1.toFixed(1)}%\nCount: ${d.length}`);
        })
        .on("mouseout", hideTooltip);

    // Add title
    svg.append("text")
        .attr("x", width/2)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .text("Distribution of Forest Area (2020)");
}

function createBoxPlot(data) {
    const margin = {top: 30, right: 30, bottom: 70, left: 60},
        width = 460 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    const svg = d3.select("#boxPlot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Compute quartiles, median, min, and max for each continent
    const continentData = d3.group(data, d => d.Continent);
    const stats = Array.from(continentData, ([key, value]) => {
        const forestValues = value.map(d => d.forestHistory[d.forestHistory.length-1].value);
        return {
            continent: key,
            q1: d3.quantile(forestValues.sort(d3.ascending), .25),
            median: d3.quantile(forestValues.sort(d3.ascending), .5),
            q3: d3.quantile(forestValues.sort(d3.ascending), .75),
            interQuantileRange: d3.quantile(forestValues.sort(d3.ascending), .75) - d3.quantile(forestValues.sort(d3.ascending), .25),
            min: d3.min(forestValues),
            max: d3.max(forestValues)
        };
    });

    const x = d3.scaleBand()
        .range([0, width])
        .domain(stats.map(d => d.continent))
        .padding(0.4);

    const y = d3.scaleLinear()
        .domain([0, 100])
        .range([height, 0]);

    // Show the X axis
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

    // Show the Y axis
    svg.append("g")
        .call(d3.axisLeft(y));

    // Show the main vertical line
    svg.selectAll("vertLines")
        .data(stats)
        .enter()
        .append("line")
        .attr("x1", d => x(d.continent) + x.bandwidth()/2)
        .attr("x2", d => x(d.continent) + x.bandwidth()/2)
        .attr("y1", d => y(d.min))
        .attr("y2", d => y(d.max))
        .attr("stroke", "black")
        .style("width", 40);

    // Create a g element for each box
    const boxWidth = 40;
    const boxes = svg.selectAll("boxes")
        .data(stats)
        .enter()
        .append("g")
        .attr("transform", d => `translate(${x(d.continent)},0)`);

    // Draw the boxes
    boxes.append("rect")
        .attr("width", x.bandwidth())
        .attr("height", d => y(d.q1) - y(d.q3))
        .attr("x", 0)
        .attr("y", d => y(d.q3))
        .attr("fill", "#69b3a2")
        .attr("stroke", "black");

    // Add median lines
    boxes.append("line")
        .attr("x1", 0)
        .attr("x2", x.bandwidth())
        .attr("y1", d => y(d.median))
        .attr("y2", d => y(d.median))
        .attr("stroke", "black")
        .style("width", 80);

    // Add title
    svg.append("text")
        .attr("x", width/2)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .text("Forest Area Distribution by Continent");
}

