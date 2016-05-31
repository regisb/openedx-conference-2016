(function(){
    Reveal.addEventListener('edx-platform-cloc', function() {
        var data = {
            name: "edx-platform",
            size: 429347,
            children: [
                {
                    name: "lms",
                    size: 170565,
                    children: [
                        {
                            name: "static",
                            size: 53188,
                            children: [
                                {
                                    name: "js", size: 25067, children: [
                                        {name: "edxnotes", size: 2126},
                                        {name: "spec", size: 11386},
                                        {name: "verify_student", size: 1403},
                                        {name: "student_account", size: 1611},
                                    ]
                                },
                                {name: "sass", size: 23797},
                                {name: "coffee", size: 2970},
                            ]
                        },
                        {
                            name: "djangoapps", size: 94686,
                            children: [
                                {name: 'courseware', size: 18077},
                                {name: 'instructor', size: 11736},
                                {name: 'shopping_cart', size: 7645},
                                {name: 'teams', size: 6564},
                                {name: 'certificates', size: 5145},
                                {name: 'discussion_api', size: 6277},
                                {name: 'django_comment_client', size: 5707},
                                {name: 'instructor_task', size: 5001},
                            ]
                        },
                    ]
                },
                {
                    name: "common",
                    size: 161902,
                    children: [
                        {
                            name: "djangoapps", size: 30606, children: [
                                {name: "student", size: 9251},
                                {name: "third_party_auth", size: 3547},
                                {name: "util", size: 2490},
                            ]
                        },
                        {
                            name: "lib", size: 80447, children: [
                                {
                                    name: "xmodule", size: 65599, children: [
                                        {name: "js", size: 24223},
                                        {name: "tests", size: 8327},
                                        {name: "modulestore", size: 17060},
                                    ]
                                },
                                {
                                    name: "capa", size: 11183, children: [
                                        {name: "tests", size: 6397},
                                        {name: "response_types.py", size: 1909},
                                    ]
                                },

                            ]
                        },
                        {
                            name: "static", size: 22783, children: [
                                {
                                    name: "js", size: 11444, children: [
                                        {name: "tests", size: 8327},
                                    ]
                                },
                                {name: "sass", size: 2898},
                            ]
                        },
                    ]
                },
                {
                    name: "cms",
                    size: 71128,
                    children: [
                        {
                            name: "djangoapps", size: 24056, children: [
                                {name: "contentstore", size: 23371, children: [
                                    {name: "views", size: 11296},
                                    {name: "tests", size: 6486},
                                ]},
                            ]
                        },
                        {
                            name: "static", size: 38379, children: [
                                {name: "js", size: 22709},
                                {name: "sass", size: 12580},

                            ]
                        },
                        {name: "templates", size: 6762},
                    ]
                },
                {
                    name: "openedx",
                    size: 18572,
                    children: [
                        {
                            name: "core", size: 18037, children: [
                                {
                                    name: "djangoapps", size: 15483, children: [
                                        {name: "user_api", size: 5897},
                                        {name: "credit", size: 3684},
                                    ]
                                },
                                {name: "lib", size: 2517},
                            ]
                        }
                    ]
                },

            ]
        };
        var fillVoids = function(node) {
            if (!node.children) {
                return node;
            }
            var childrenSize = 0;
            for(var i=0; i < node.children.length; i++) {
                fillVoids(node.children[i]);
                childrenSize += node.children[i].size;
            }
            if(!node.size) {
                node.size = childrenSize;
            } else if (childrenSize < node.size) {
                node.children.push({"name": "empty", "size": node.size - childrenSize});
            }
        };
        fillVoids(data);

        var width = 960,
            height = 700,
            radius = Math.min(width, height) / 2,
            color = d3.scale.category20();

        var element = d3.select("#edx-platform-cloc");
        var svg = element
            .append("svg")
                .attr("width", width)
                .attr("height", height)
            .append("g")
                .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        var partition = d3.layout.partition()
            .size([2 * Math.PI, radius])
            .value(function(d) { return d.size; })
            .sort(function(d1, d2) {
                var valueOf = function(d) {
                    return d.name === "empty"? 0 : d.value;
                };
                return valueOf(d2) - valueOf(d1);
            });

        var arc = d3.svg.arc()
            .startAngle(function(d) { return d.x; })
            .endAngle(function(d) { return d.x + d.dx; })
            .innerRadius(function(d) { return d.y; })
            .outerRadius(function(d) { return d.y + d.dy; });

        // Be careful: angles are counted in the clockwise direction, with angle 0
        // pointing to the top
        var fontSize = 4;
        var positionY = function(d) {
            return (d.y === 0 ? 0 : d.y + 0.5*d.dy) - 0.5*fontSize;
        };
        var positionLeft = function(d) {
            return width/2 + positionY(d) * Math.sin(d.x + d.dx/2) - d.name.length*0.5*fontSize + "px";
        };
        var positionTop = function(d) {
            return height/2 - positionY(d) * Math.cos(d.x + d.dx/2) + "px";
        };
        var colorize = function(d) {
            if (d.name === "empty") {
                return "#fff";
            }
            if(d.parent && d.parent.parent && d.children) {
                return colorize(d.parent);
            }
            return color(d.name);
            //return d3.rgb(colorize(d.parent)).darker(0.1);
            //return color(d.parent.children.indexOf(d));
            //return color((d.children ? d : d.parent).name);
        };

        var path = svg.datum(data).selectAll("path")
            .data(partition.nodes)
                .enter().append("path")
                    //.attr("display", function(d) { return d.depth ? null : "none"; }) // hide inner ring
                    .attr("d", arc)
                    .style("stroke", "#fff")
                    .style("fill", colorize)
                    .style("fill-rule", "evenodd");
        var div = element.datum(data).selectAll(".d3-label")
            .data(partition.nodes)
                .enter().append("div")
                    .attr("class", "d3-label")
                    .attr("title", function(d) {return d.size;})
                    .style("left", positionLeft)
                    .style("top", positionTop)
                    .text(function(d) { return d.name === "empty" ? "" : d.name; });

        d3.select(self.frameElement).style("height", height + "px");
    });
})();
