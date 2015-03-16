      var w = $(window).width(), h = $(window).height();

      var labelDistance = 0;

      var vis = d3.select("body").append("svg:svg").attr("width", w).attr("height", h);

      var nodes = [];
      var edges = [];

      var force = d3.layout.force().size([w, h]).nodes(nodes).links(edges).gravity(1).linkDistance(120).charge(-7000).linkStrength(function(x) {
        return x.weight * 10
      });

      var edge = vis.selectAll("line.edge")
      var node = vis.selectAll("g.node")  

      function restart() {
        edge = edge.data(edges).enter().append("svg:line").attr("class", function (d) {
          return "edge edge-" + d.type;
        });

        node = node.data(force.nodes()).enter().append("svg:g");
        node.append("svg:ellipse").attr("rx", 45).attr("ry", 20).attr("class", "serviceNode shadowed");
        node.append("svg:text").text(function(d) {
          return d.label;
        }).attr("class", "serviceName");
        node.call(force.drag);

        force.start();
      }

      d3.json("system.json", function (error, system) {
        var nodeIndex = {};
        system.services.forEach(function (service, i) {
          var node = {
            label: service.name
          };
          nodes.push(node);
          nodeIndex[service.name] = i;
        });
        system.services.forEach(function (service, i) {
          if (service.references) {
            service.references.forEach(function (reference) {
              if (nodeIndex[reference.service]) {
                var e = {
                  source: i,
                  target: nodeIndex[reference.service],
                  weight: Math.random(),
                  type: reference.type
                };
                edges.push(e);
              }
            });
          }
        });
        restart();
      });

      var updateEdge = function() {
        this.attr("x1", function(d) {
          return d.source.x;
        }).attr("y1", function(d) {
          return d.source.y;
        }).attr("x2", function(d) {
          return d.target.x;
        }).attr("y2", function(d) {
          return d.target.y;
        });
      }

      var updateNode = function() {
        this.attr("transform", function(d) {
          return "translate(" + d.x + "," + d.y + ")";
        });
      }

      force.on("tick", function() {
        node.call(updateNode);
        edge.call(updateEdge);
      });