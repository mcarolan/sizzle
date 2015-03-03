var width = $(window).width(),
    height = $(window).height();

var color = d3.scale.category20();

var force = d3.layout.force()
    .size([width, height])
    .gravity(1)
    .linkDistance(100)
    .charge(-3000)
    .linkStrength(function(x) {
        return x.weight * 10
      });

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

var nodeGroup = svg.append('svg:g').selectAll('g');

d3.json("system.json", function(error, system) {
  var nodes = system.services.slice(),
      links = [];

  var serviceLookup = {};
  for (i in nodes) {
    serviceLookup[nodes[i].name] = i;
  }

  for (i in nodes) {
    var service = nodes[i];

    for (j in service.references) {
      var reference = service.references[j];
      if (serviceLookup[reference.service]) {
        var link = {source: parseInt(i, 10), target: parseInt(serviceLookup[reference.service], 10), weight: Math.random()};
        links.push(link);
      }
      else {
        console.log("did not create edge for unknown service " + reference.service);
      }
    }
  }

  force
      .nodes(nodes)
      .links(links)
      .start();

  var link = svg.selectAll(".link")
      .data(links)
    .enter().append("path")
      .attr("class", "link");

  nodeGroup = nodeGroup.data(nodes, function(d) { return d.index; });
  var g = nodeGroup.enter().append('svg:g'); 

  g.append("ellipse")
    .attr("class", "node")
    .attr("rx", 30)
    .attr("ry", 20)
    .style("fill", function(d) { return color(d.group); })
    .call(force.drag);

  g.append("svg:text")
      .attr('x', 0)
      .attr('y', 4)
      .attr('class', 'id')
      .text(function(d) { return d.name; });

  nodeGroup.exit().remove()

  force.on("tick", function() {
    link.attr('d', function(d) {
    var deltaX = d.target.x - d.source.x,
        deltaY = d.target.y - d.source.y,
        dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
        normX = deltaX / dist,
        normY = deltaY / dist,
        sourcePadding = 20,
        targetPadding = 20,
        sourceX = d.source.x + (sourcePadding * normX),
        sourceY = d.source.y + (sourcePadding * normY),
        targetX = d.target.x - (targetPadding * normX),
        targetY = d.target.y - (targetPadding * normY);
      return 'M' + sourceX + ',' + sourceY + 'L' + targetX + ',' + targetY;
    });
    nodeGroup.attr("transform", function(d) {
      return "translate(" + d.x + "," + d.y + ")";
    });
  });
});