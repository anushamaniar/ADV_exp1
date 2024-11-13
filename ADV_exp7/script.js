// Load and process the data
d3.csv("Finance_data.csv").then(function(data) {
    createGenderBarChart(data);
    createAgeHistogram(data);
    createInvestmentPieChart(data);
    createScatterPlot(data);
    createViolinPlot(data);
    createDurationBubblePlot(data);
    createMonitoringBarChart(data);
    createObjectivesSunburst(data);
});

// Reusable legend function
function addLegend(svg, colorScale, width, height, title) {
  const legendSpacing = 20;
  const legendRectSize = 18;
  
  const legend = svg.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${width + 10}, 0)`);

  legend.append("text")
      .attr("class", "legend-title")
      .attr("x", 0)
      .attr("y", -10)
      .text(title);

  const legendItems = legend.selectAll(".legend-item")
      .data(colorScale.domain())
      .enter()
      .append("g")
      .attr("class", "legend-item")
      .attr("transform", (d, i) => `translate(0, ${i * legendSpacing})`);

  legendItems.append("rect")
      .attr("width", legendRectSize)
      .attr("height", legendRectSize)
      .style("fill", colorScale);

  legendItems.append("text")
      .attr("x", legendRectSize + 5)
      .attr("y", legendRectSize - 5)
      .text(d => d);
}

// Gender Bar Chart
function createGenderBarChart(data) {
  const margin = {top: 20, right: 120, bottom: 50, left: 60};
  const width = 600 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  const svg = d3.select("#genderBarChart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  const genderCount = d3.rollup(data, v => v.length, d => d.gender);
  const genderData = Array.from(genderCount, ([key, value]) => ({
      gender: key,
      count: value,
      percentage: (value / data.length * 100).toFixed(1)
  }));

  const x = d3.scaleBand()
      .range([0, width])
      .padding(0.1);

  const y = d3.scaleLinear()
      .range([height, 0]);

  const colorScale = d3.scaleOrdinal()
      .domain(genderData.map(d => d.gender))
      .range(["#FF69B4", "#4169E1"]);

  x.domain(genderData.map(d => d.gender));
  y.domain([0, d3.max(genderData, d => d.count)]);

  // Add X axis
  svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .append("text")
      .attr("x", width / 2)
      .attr("y", 35)
      .attr("fill", "black")
      .style("text-anchor", "middle")
      .text("Gender");

  // Add Y axis
  svg.append("g")
      .call(d3.axisLeft(y))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -45)
      .attr("x", -height / 2)
      .attr("fill", "black")
      .style("text-anchor", "middle")
      .text("Number of Investors");

  // Add bars
  svg.selectAll(".bar")
      .data(genderData)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.gender))
      .attr("width", x.bandwidth())
      .attr("y", d => y(d.count))
      .attr("height", d => height - y(d.count))
      .style("fill", d => colorScale(d.gender));

  // Add value labels on bars
  svg.selectAll(".label")
      .data(genderData)
      .enter()
      .append("text")
      .attr("class", "label")
      .attr("x", d => x(d.gender) + x.bandwidth() / 2)
      .attr("y", d => y(d.count) - 5)
      .attr("text-anchor", "middle")
      .text(d => `${d.count} (${d.percentage}%)`);

  // Add legend
  addLegend(svg, colorScale, width, height, "Gender Distribution");
}

// Age Histogram
function createAgeHistogram(data) {
  const margin = {top: 20, right: 120, bottom: 50, left: 60};
  const width = 600 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  const svg = d3.select("#ageHistogram")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear()
      .domain([d3.min(data, d => +d.age), d3.max(data, d => +d.age)])
      .range([0, width]);

  const histogram = d3.histogram()
      .value(d => +d.age)
      .domain(x.domain())
      .thresholds(x.ticks(20));

  const bins = histogram(data);

  const y = d3.scaleLinear()
      .domain([0, d3.max(bins, d => d.length)])
      .range([height, 0]);

  // Add X axis
  svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .append("text")
      .attr("x", width / 2)
      .attr("y", 35)
      .attr("fill", "black")
      .style("text-anchor", "middle")
      .text("Age");

  // Add Y axis
  svg.append("g")
      .call(d3.axisLeft(y))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -45)
      .attr("x", -height / 2)
      .attr("fill", "black")
      .style("text-anchor", "middle")
      .text("Frequency");

  // Add histogram bars
  svg.selectAll("rect")
      .data(bins)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.x0))
      .attr("width", d => x(d.x1) - x(d.x0) - 1)
      .attr("y", d => y(d.length))
      .attr("height", d => height - y(d.length))
      .style("fill", "#69b3a2")
      .on("mouseover", function(event, d) {
          d3.select(this)
              .style("opacity", 0.8);
          
          // Add tooltip
          svg.append("text")
              .attr("class", "tooltip")
              .attr("x", x(d.x0) + (x(d.x1) - x(d.x0)) / 2)
              .attr("y", y(d.length) - 5)
              .attr("text-anchor", "middle")
              .text(`Count: ${d.length}`);
      })
      .on("mouseout", function() {
          d3.select(this)
              .style("opacity", 1);
          svg.selectAll(".tooltip").remove();
      });
}

// Investment Pie Chart
function createInvestmentPieChart(data) {
  const margin = {top: 20, right: 200, bottom: 30, left: 40};
  const width = 600 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;
  const radius = Math.min(width, height) / 2;

  const svg = d3.select("#investmentPieChart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${width/2 + margin.left},${height/2 + margin.top})`);

  const investmentCount = d3.rollup(data, v => v.length, d => d.Avenue);
  const pieData = Array.from(investmentCount, ([key, value]) => ({
      avenue: key,
      count: value,
      percentage: (value / data.length * 100).toFixed(1)
  }));

  const color = d3.scaleOrdinal()
      .domain(pieData.map(d => d.avenue))
      .range(d3.schemeCategory10);

  const pie = d3.pie()
      .value(d => d.count);

  const arc = d3.arc()
      .innerRadius(0)
      .outerRadius(radius);

  const labelArc = d3.arc()
      .innerRadius(radius - 40)
      .outerRadius(radius - 40);

  const pieChart = svg.selectAll(".arc")
      .data(pie(pieData))
      .enter().append("g")
      .attr("class", "arc");

  pieChart.append("path")
      .attr("d", arc)
      .style("fill", d => color(d.data.avenue));

  pieChart.append("text")
      .attr("transform", d => `translate(${labelArc.centroid(d)})`)
      .attr("dy", ".35em")
      .style("text-anchor", "middle")
      .text(d => `${d.data.avenue}: ${d.data.percentage}%`);

  // Add legend
  addLegend(svg, color, width, height, "Investment Avenue Distribution");
}

// Scatter Plot
function createScatterPlot(data) {
  const margin = {top: 20, right: 20, bottom: 50, left: 50};
  const width = 600 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  const svg = d3.select("#scatterPlot")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear()
      .domain([0, d3.max(data, d => +d.age)])
      .range([0, width]);

  const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => +d.amount)])
      .range([height, 0]);

  // Add X axis
  svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .append("text")
      .attr("x", width / 2)
      .attr("y", 35)
      .attr("fill", "black")
      .style("text-anchor", "middle")
      .text("Age");

  // Add Y axis
  svg.append("g")
      .call(d3.axisLeft(y))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -45)
      .attr("x", -height / 2)
      .attr("fill", "black")
      .style("text-anchor", "middle")
      .text("Investment Amount");

  // Add scatter points
  svg.selectAll(".dot")
      .data(data)
      .enter().append("circle")
      .attr("class", "dot")
      .attr("cx", d => x(d.age))
      .attr("cy", d => y(d.amount))
      .attr("r", 5)
      .style("fill", "#69b3a2");
}

// Create Violin Plot
function createViolinPlot(data) {
    const margin = {top: 20, right: 120, bottom: 50, left: 60};
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
  
    const svg = d3.select("#violinPlot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
  
    // Convert age data for violin plot
    const bins = d3.histogram()
        .domain(d3.extent(data, d => +d.age))
        .thresholds(40)
        .value(d => +d.age);
  
    const violinData = d3.rollup(data, 
      v => {
        const binned = bins(v.map(d => +d.age));
        return binned.map(b => ({
          x0: b.x0,
          x1: b.x1,
          length: b.length
        }));
      },
      d => d.gender
    );
  
    const x = d3.scaleBand()
        .range([0, width])
        .domain(Array.from(violinData.keys()))
        .padding(0.1);
  
    const y = d3.scaleLinear()
        .domain([d3.min(data, d => +d.age), d3.max(data, d => +d.age)])
        .range([height, 0]);
  
    // Create violin shapes
    Array.from(violinData).forEach(([key, value]) => {
      const xNum = d3.scaleLinear()
          .domain([0, d3.max(value, d => d.length)])
          .range([0, x.bandwidth()/2]);
  
      const area = d3.area()
          .x0(d => x(key) + x.bandwidth()/2 - xNum(d.length))
          .x1(d => x(key) + x.bandwidth()/2 + xNum(d.length))
          .y(d => y((d.x0 + d.x1)/2))
          .curve(d3.curveCatmullRom);
  
      svg.append("path")
          .datum(value)
          .attr("class", "violin")
          .attr("d", area)
          .style("fill", key === "Male" ? "#4169E1" : "#FF69B4")
          .style("opacity", 0.8);
    });
  
    // Add axes
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .append("text")
        .attr("x", width/2)
        .attr("y", 40)
        .attr("fill", "black")
        .text("Gender");
  
    svg.append("g")
        .call(d3.axisLeft(y))
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -45)
        .attr("x", -height/2)
        .attr("fill", "black")
        .style("text-anchor", "middle")
        .text("Age Distribution");
  }
  
  // Create Duration Bubble Plot
  function createDurationBubblePlot(data) {
    const margin = {top: 20, right: 120, bottom: 50, left: 60};
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
  
    const svg = d3.select("#durationBubblePlot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
  
    // Process data for bubble plot
    const durationData = Array.from(
      d3.rollup(data,
        v => ({
          count: v.length,
          avgAge: d3.mean(v, d => +d.age)
        }),
        d => d.Duration
      ),
      ([duration, stats]) => ({
        duration,
        count: stats.count,
        avgAge: stats.avgAge
      })
    );
  
    const x = d3.scaleBand()
        .range([0, width])
        .domain(durationData.map(d => d.duration))
        .padding(0.1);
  
    const y = d3.scaleLinear()
        .domain([0, d3.max(durationData, d => d.avgAge)])
        .range([height, 0]);
  
    const radius = d3.scaleSqrt()
        .domain([0, d3.max(durationData, d => d.count)])
        .range([5, 30]);
  
    const color = d3.scaleOrdinal()
        .domain(durationData.map(d => d.duration))
        .range(d3.schemeCategory10);
  
    // Add bubbles
    svg.selectAll(".bubble")
        .data(durationData)
        .enter()
        .append("circle")
        .attr("class", "bubble")
        .attr("cx", d => x(d.duration) + x.bandwidth()/2)
        .attr("cy", d => y(d.avgAge))
        .attr("r", d => radius(d.count))
        .style("fill", d => color(d.duration))
        .style("opacity", 0.7)
        .on("mouseover", function(event, d) {
            d3.select(this)
                .style("opacity", 1);
            
            svg.append("text")
                .attr("class", "bubble-tooltip")
                .attr("x", x(d.duration) + x.bandwidth()/2)
                .attr("y", y(d.avgAge) - radius(d.count) - 5)
                .attr("text-anchor", "middle")
                .text(`Count: ${d.count}, Avg Age: ${d.avgAge.toFixed(1)}`);
        })
        .on("mouseout", function() {
            d3.select(this)
                .style("opacity", 0.7);
            svg.selectAll(".bubble-tooltip").remove();
        });
  
    // Add axes
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");
  
    svg.append("g")
        .call(d3.axisLeft(y))
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -45)
        .attr("x", -height/2)
        .attr("fill", "black")
        .style("text-anchor", "middle")
        .text("Average Age");
  
    // Add legend
    addLegend(svg, color, width, height, "Investment Duration");
  }
  
  // Create Monitoring Bar Chart
  function createMonitoringBarChart(data) {
    const margin = {top: 20, right: 120, bottom: 50, left: 60};
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
  
    const svg = d3.select("#monitoringBarChart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
  
    // Process data for monitoring frequency
    const monitoringData = Array.from(
      d3.rollup(data,
        v => ({
          count: v.length,
          percentage: (v.length / data.length * 100).toFixed(1)
        }),
        d => d.Invest_Monitor
      ),
      ([frequency, stats]) => ({
        frequency,
        count: stats.count,
        percentage: stats.percentage
      })
    );
  
    const x = d3.scaleBand()
        .range([0, width])
        .domain(monitoringData.map(d => d.frequency))
        .padding(0.1);
  
    const y = d3.scaleLinear()
        .domain([0, d3.max(monitoringData, d => d.count)])
        .range([height, 0]);
  
    const color = d3.scaleOrdinal()
        .domain(monitoringData.map(d => d.frequency))
        .range(["#69b3a2", "#404080", "#e60049"]);
  
    // Add bars
    svg.selectAll(".bar")
        .data(monitoringData)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.frequency))
        .attr("width", x.bandwidth())
        .attr("y", d => y(d.count))
        .attr("height", d => height - y(d.count))
        .style("fill", d => color(d.frequency));
  
    // Add value labels on bars
    svg.selectAll(".label")
        .data(monitoringData)
        .enter()
        .append("text")
        .attr("class", "label")
        .attr("x", d => x(d.frequency) + x.bandwidth()/2)
        .attr("y", d => y(d.count) - 5)
        .attr("text-anchor", "middle")
        .text(d => `${d.count} (${d.percentage}%)`);
  
    // Add axes
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");
  
    svg.append("g")
        .call(d3.axisLeft(y))
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -45)
        .attr("x", -height/2)
        .attr("fill", "black")
        .style("text-anchor", "middle")
        .text("Number of Investors");
  
    // Add legend
    addLegend(svg, color, width, height, "Monitoring Frequency");
  }
  
  // Create Investment Objectives Sunburst
  function createObjectivesSunburst(data) {
    const margin = {top: 20, right: 120, bottom: 50, left: 60};
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
    const radius = Math.min(width, height) / 2;
  
    const svg = d3.select("#objectivesSunburst")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${width/2 + margin.left},${height/2 + margin.top})`);
  
    // Process data for hierarchical structure
    const nest = d3.nest()
        .key(d => d.Purpose)
        .key(d => d.Objective)
        .entries(data);
  
    const root = d3.hierarchy({values: nest}, d => d.values)
        .sum(d => d.value || 1);
  
    const partition = d3.partition()
        .size([2 * Math.PI, radius]);
  
    const arc = d3.arc()
        .startAngle(d => d.x0)
        .endAngle(d => d.x1)
        .innerRadius(d => d.y0)
        .outerRadius(d => d.y1);
  
    const color = d3.scaleOrdinal(d3.schemeCategory10);
  
    // Add sunburst segments
    const paths = svg.selectAll("path")
        .data(partition(root).descendants())
        .enter()
        .append("path")
        .attr("d", arc)
        .style("fill", d => color(d.data.key || d.data.Purpose))
        .style("opacity", 0.8)
        .on("mouseover", function(event, d) {
            d3.select(this)
                .style("opacity", 1);
            
            // Add tooltip
            const percentage = ((d.value / root.value) * 100).toFixed(1);
            svg.append("text")
                .attr("class", "sunburst-tooltip")
                .attr("text-anchor", "middle")
                .attr("dy", "-1em")
                .text(`${d.data.key || d.data.Purpose}: ${percentage}%`);
        })
        .on("mouseout", function() {
            d3.select(this)
                .style("opacity", 0.8);
            svg.selectAll(".sunburst-tooltip").remove();
        });
  
    // Add legend
    const legendData = root.descendants()
        .filter(d => d.depth === 1)
        .map(d => d.data.key);
    
    addLegend(svg, color.domain(legendData), width/2, height/2, "Investment Objectives");
  }
