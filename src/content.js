import createDOMPurify from 'dompurify';
import { AGO } from './core';

window.console.log('AGO', AGO);

const DOMPurify = createDOMPurify(window);

window.console.log(DOMPurify);

AGO.Main = {
    Messages: function (a, b) {
        "Display" === a && AGO.Main.Display(b)
    }, Read: function () {
        var a;
        a = {commander: 0, admiral: 0, engineer: 0, geologist: 0, technocrat: 0};
        DOM.iterateChildren(document.getElementById("officers"), function (b) {
                var d = b.className || "";
                HTML.hasClass(d, "on") && OBJ.iterate(a, function (b) {
                        HTML.hasClass(d, b) && (a[b] = 1
                        )
                    }
                )
            }
        );
        OBJ.iterate(a, function (b) {
                AGO.Option.set(b, a[b])
            }
        );
        document.getElementById("officers").classList.contains("all") ? AGO.Option.set("comstaff", 1) : AGO.Option.set("comstaff", 0);
		
		if (!AGO.Option.get("nextItem", 0)) {
            AGO.Trader && AGO.Trader.updateNextItem(0, function (highlight) {
                1 === highlight && (DOM.addClass(".premiumHighligt", null, "selected"));
            });
        } else if (AGO.Time.ogameTime > AGO.Option.get("nextItem", 0)) {
            DOM.addClass(".premiumHighligt", null, "selected");
        }
    },
    Run: function () {
        let menuToolsWrapper;
        if (menuToolsWrapper = document.getElementById("menuTableTools")) {
            let docFrag, listItem, menuIcon, buttonText, menuButton;
            docFrag = document.createDocumentFragment();
            listItem = docFrag.appendChild(document.createElement("li"));
            menuIcon = DOM.appendSPAN(listItem, "menu_icon");
            DOM.appendA(menuIcon, {id: "ago_menubutton_logo", "class": "ago_menubutton_logo_inactive"}, {click: AGO.Main.clickIcon});
            menuButton = DOM.appendA(listItem, {id: "ago_menubutton", "class": "menubutton"}, {click: AGO.Main.clickButton});
            buttonText = 1 < AGO.App.beta ? "AGRalpha" : AGO.App.beta ? "AGRbeta" : "AntiGameReborn";
            DOM.appendSPAN(menuButton, "textlabel", buttonText);
            DOM.appendSPAN(menuButton, {id: "ago_menubutton_coords"});
            DOM.prependChild(menuToolsWrapper, docFrag);
            !AGO.App.disabled && 30 < AGO.Notify.problem && DOM.setStyleColor("ago_menubutton", "id", "#FF0000");
        }

        if (20 > AGO.Notify.problem) {
            // O03 = "The OGame logo is linked to page"
            let logoTarget;
            logoTarget = ["", "fleet1", "movement", "galaxy", "messages"][AGO.Option.get("O03", 2)];
            if (logoTarget) {
                let ogameLogo = document.getElementById("logoLink");
                if (ogameLogo) ogameLogo.parentNode.href = AGO.Uni.path + logoTarget;
            }

            let playerName;
            if (playerName = document.getElementById("playerName")) {
                // add App title (e.g. "EN Polaris") infront of playerName
                if (3 !== playerName.childNodes[0].nodeType) {
                    DOM.prependChild(playerName, document.createTextNode(AGO.App.title + " "))
                } else {
                    playerName.childNodes[0].textContent = AGO.App.title + " ";
                }

                //if player is outlaw display time left to lose outlaw status behind playerName
                let outlaw;
                if ((outlaw = playerName.querySelector(".status_abbr_outlaw")) && outlaw.title) {
                    let timeLeft, timePart;

                    timeLeft = "";
                    for (outlaw = outlaw.title; timePart = /\d{1,2}\D/g.exec(outlaw);) {
                        timeLeft += timePart[0] + " ";
                        outlaw = outlaw.split(timePart[0]).join("");
                    }

                    DOM.appendTEXT(playerName, timeLeft);
                }
            }

            // O04 = "Show community, universe and next event time in windows title"
            AGO.Main.modeTitle = AGO.Option.is("O04") ? 3 : 0;
            AGO.Main.Display();
        }
    }, Complete: function () {
        AGO.Main.updateTitle();
        AGO.Main.Check()
    }, onKeydown: function (a) {
        var b;
        let ctrlArrowPlanetSwitch = AGO.Option.is("U35");
		if (112 <= a.keyCode && 123 >= a.keyCode && AGO.Option.is("U32")) {
			if ((b = document.querySelectorAll("#planetList .smallplanet a.planetlink")) && b[a.keyCode - 112]) 
				DOM.click(a.shiftKey ? "a.moonlink" : "a.planetlink", b[a.keyCode - 112].parentNode); 
			return false;
		} else if (a.keyCode >= 37 && a.keyCode <= 40 && a.ctrlKey && ctrlArrowPlanetSwitch) {
            if (document.activeElement.tagName in {'TEXTAREA': 1}) return;
			let direction = {37: "left", 38: "up", 39: "right", 40: "down"}[a.keyCode];
			if ("left" === direction)
                AGO.Planets.Action({mode: "set", type: 1, wait: 1});
			else if ("right" === direction)
                AGO.Planets.Action({mode: "set", type: 3, wait: 1});
			else if (VAL.check(direction, "up", "down"))
			    AGO.Planets.Action({scroll: direction, wait: 1});
		} else {
			return true;
		}
    }, onSwipe: function (a, b) {
        if (12 === b) {
            AGO.Panel.onSwipe(a);
        } else if (15 ===
            b) {
            AGO.Planets.onSwipe(a)
        }
    },
    Display: function () {
        let target, color, coords, spanClass;
        spanClass = "inactive";

        // "I83": "Select the active target always when loading Fleet I."
        if (AGO.Option.is("I83")) {
            target = AGO.Panel.getActive("Target", "coords", 6);
            coords = AGO.Task.cutCoords(target);
            color = OBJ.get(AGO.Styles.colorType, +target.split(":")[3] || 1) || "";
            spanClass = coords || AGO.Panel.getActive("Target", "time") ? "autocopy" : "coords";
        }

        DOM.updateText("ago_menubutton_coords", "id", coords);
        DOM.setStyleColor("ago_menubutton_coords", "id", color);
        DOM.updateClass("ago_menubutton_logo", "id", "ago_menubutton_logo_" + spanClass);
    },
    clickButton: function () {
        if (AGO.App.disabled) {
            AGO.App.Save({disabled: false});
            AGO.Init.Location("", 1000);
        } else {
            if (20 > AGO.Notify.problem) {
                AGO.Option.Menu();
            }
        }
    },
    updateButton: function () {
        5 < AGO.Init.status && DOM.setStyleColor("ago_menubutton", "id", AGO.Notify.color || "");
    },
    updateInfo: function (type, label, color) {
        if (5 < AGO.Init.status && type) {
            AGO.Main.statusInfo = 2;
            let infoWrap = document.getElementById("ago_menubutton_info");

            // if there is no info beneath the menu button, create one
            if (!infoWrap) {
                let menuButton, newWrap;
                if (menuButton = document.getElementById("ago_menubutton"))  {
                    newWrap = document.createElement("li");
                    newWrap.className = "ago_menubutton_info";
                    infoWrap = newWrap.appendChild(document.createElement("div"));
                    infoWrap.id = "ago_menubutton_info";
                    DOM.after(menuButton.parentNode, newWrap);
                } else {
                    infoWrap = void 0;
                }
            }

            if (infoWrap) {
                let infoSpan;
                if (!DOM.hasChildren(infoWrap)) {
                    infoWrap.parentNode.style.display = "list-item";
                    window.setTimeout(AGO.Main.hideInfo, AGO.Notify.loading ? 4E3 : 2E3);
                }

                infoSpan = document.getElementById("ago_menubutton_info_" + type) || DOM.append(infoWrap, "span", {id: "ago_menubutton_info_" + type}, {display: "block"});
                DOM.updateText(infoSpan, null, label);
                DOM.updateStyle(infoSpan, null, "color", color);
            }
        }
    },
    hideInfo: function () {
        let infoWrap;

        // statusInfo starts with 2 and is decreased by 1 everytime hideInfo is called until it reaches 0
        // when it reaches 0 the info wrap is removed
        AGO.Main.statusInfo = Math.max(AGO.Main.statusInfo - 1, 0);
        if (AGO.Main.statusInfo) {
            window.setTimeout(AGO.Main.hideInfo, AGO.Notify.loading ? 4E3 : 2E3);
        } else {
            AGO.Notify.set("Hide");

            if (infoWrap = document.getElementById("ago_menubutton_info")) {
                DOM.removeChildren(infoWrap);
                DOM.setStyleDisplay(infoWrap.parentNode);
            }
        }
    },
    clickIcon: function () {
        // toggle I83
        // "I83": "Select the active target always when loading Fleet I."
        AGO.Option.set("I83", !AGO.Option.is("I83"), 1);
        AGO.Init.Messages("Main", "Display"); // AGO.Main.Display();
        AGO.Init.Messages("Panel", "Display"); // AGO.Panel.Display();
    }, updateTitle: function () {
        if (AGO.Option.is('O04'))
            if ((AGO.Main.modeTitle > 0) && DOM.getProperty("eventboxBlank", "id", "offsetHeight", 2)) {
                document.title = AGO.App.title;
                AGO.Main.modeTitle--;
            } else {
                var missionCounter = DOM.getText("tempcounter", "id");
                var missionType = DOM.getText("#eventboxFilled .next_event + .next_event .undermark");
                if (missionCounter && missionType) {
                    document.title = AGO.App.title + " - " + missionCounter + " - " + missionType;
                } else {
                    document.title = AGO.App.title;
                }
            }
    }, Check: function () {}
};
AGO.Planets = {
    status: 0,
    updateDisplayStatus: 0,
    selectedPlanet: 0,
    selectedType: 0,
    switchTimeout: 0,
    Data: {},
    ByIndex: [],
    ByCoords: {},
    ByCoordstype: {},
    Task: {},
    Messages: function (a, b) {
        "Action" === a ? AGO.Planets.Action(b) : "Display" === a && AGO.Planets.Display()
    },
    Timer: function () {
        0 < AGO.Planets.updateDisplayStatus && AGO.Planets.Display()
    },
    onSwipe: function (a) {
        "left" === a ? AGO.Planets.Action({mode: "set", type: 1}) : "right" === a ? AGO.Planets.Action({
                mode: "set",
                type: 3
            }
        ) : VAL.check(a, "up", "down") && AGO.Planets.Action({scroll: a})
    },
    Read: function () {
        var a, b, d, c, e, f, g = 0, h;
        a = document.getElementById("planetList");
        b = DOM.getText("#countColonies .textCenter span").split("/");
        AGO.Planets.count = NMR.parseIntAbs(b[0]);
        AGO.Planets.possible = NMR.parseIntAbs(b[1]);
        if (a && DOM.hasChildren(a) >= AGO.Planets.count) {
            for (AGO.Planets.status = 1, a = a.firstChild; a; a = a.nextSibling) {
                if (1 === a.nodeType && (h = STR.check(NMR.parseIntAbs(a.id))
                )) {
                    g++;
                    c = {index: g, type: 1};
                    e = {index: g, type: 3, planet: h};
                    for (b = a.firstChild; b; b = b.nextSibling) {
                        if (1 === b.nodeType) {
                            if (f = b.className || "", -1 < f.indexOf("planetlink")) {
                                for (f = b.title || "", c.name = (f.split("[", 1)[0].split("<b>",
                                        2
                                    )[1] || ""
                                ).trim(), c.temp = NMR.parseInt((f.match(/<br\/>.*<br>[^\d\-]*([\d\-]+)/i) || []
                                    )[1]
                                ), d = b.firstChild; d; d = d.nextSibling) {
                                    1 === d.nodeType && (f = d.className || "", -1 < f.indexOf("planetPic") ? c.img = d.src : -1 < f.indexOf("planet-koords") && (c.coords = (d.textContent || ""
                                            ).replace(/[^\d\:]/g, "")
                                        )
                                    );
                                }
                            } else if (-1 < f.indexOf("moonlink")) {
                                for (f = b.title || "", c.moon = STR.check(NMR.parseIntAbs(STR.getParameter("cp", b.href))), e.name = (f.split("[", 1)[0].split("<b>", 2)[1] || ""
                                ).trim(), d = b.firstChild; d; d = d.nextSibling) {
                                    1 === d.nodeType &&
                                    (f = d.className || "", -1 < f.indexOf("icon-moon") && (e.img = d.src
                                        )
                                    );
                                }
                            } else {
                                -1 < f.indexOf("constructionIcon") && (d = b.querySelector(".icon_wrench_red") ? -1 : 1, -1 < f.indexOf("moon") ? e.construction = d : c.construction = d
                                );
                            }
                        }
                    }
                    c.coords && (c.coordstype = c.coords + ":1", AGO.Planets.Data[h] = c, AGO.Planets.ByCoords[c.coords] = h, AGO.Planets.ByIndex[c.index] = h, AGO.Planets.ByCoordstype[c.coordstype] = h, c.moon && (e.coords = c.coords, e.coordstype = c.coords + ":3", AGO.Planets.Data[c.moon] = e, AGO.Planets.ByCoordstype[e.coordstype] = c.moon
                        )
                    )
                }
            }
        } else {
            AGO.Planets.status =
                0, AGO.Planets.count && AGB.Log("Planets - Error - Something wrong with the planetlist !", !0)
        }
    },
    Run: function () {
        var a, b, d;
        b = AGO.Option.is("O53");
        d = AGO.Option.isAnd("U32", "O54");
        (a = document.getElementById("rechts")
        ) && AGO.Option.is("O50") && (AGO.Planets.enabled = !0, AGO.Planets.improve = AGO.Option.is("O51"), AGO.Planets.coloring = AGO.Option.isAnd("CS0", "O55"), AGO.Option.is("O52") && DOM.extendClass(a, null, "ago_planets_shrink"), a = document.createDocumentFragment(), DOM.appendSPAN(a, "ago_planets_arrow_planet"), DOM.appendSPAN(a,
                "ago_planets_arrow_moon"
            ), DOM.appendChild(document.getElementById("countColonies"), a), DOM.iterateChildren(document.getElementById("planetList"), function (a) {
                    var e, f;
                    DOM.setAttribute(".activity img", a, "src", "/cdn/img/galaxy/activity15.gif");
                    f = STR.check(NMR.parseIntAbs(a.id));
                    AGO.Planets.Data[f] && (AGO.Planets.coloring && AGO.Acc.coords === AGO.Planets.Data[f].coords && DOM.extendClass(a, null, AGO.Token.getClassHighlight(AGO.Acc.type)), d && DOM.appendSPAN(a, "ago_planets_shortcut", AGO.Planets.Data[f].index), b &&
                        (AGO.Planets.Data[f].construction && (e = (a.querySelector(".constructionIcon:not(.moon)") || {}
                                ).title, DOM.appendSPAN(a, "ago_planets_construction", e)
                            ), AGO.Planets.Data[f].moon && AGO.Planets.Data[AGO.Planets.Data[f].moon].construction && (e = (a.querySelector(".constructionIcon.moon") || {}
                                ).title, DOM.appendSPAN(a, "ago_planets_construction_moon", e)
                            )
                        )
                    )
                }
            ), AGO.Planets.coloring && DOM.addEvents("rechts", "id", {
                    click: AGO.Planets.click,
                    mouseover: AGO.Planets.hover,
                    mouseout: AGO.Planets.hover
                }
            ), DOM.addEvents("countColonies",
                "id", {click: AGO.Planets.clickArrow}
            ), AGO.Planets.Display(!0)
        );
        a = a = null
    },
    Display: function (a) {
        var b, d, c, e, f;
        if (b = document.getElementById("planetList")) {
            if (a || 0 < AGO.Planets.updateDisplayStatus) {
                AGO.Planets.updateDisplayStatus--, AGO.Planets.iterate(3, function (a, h) {
                    if (c = AGO.Fleet.Get("Cooldown", h, 2)) {
                            c = AGO.Ogame.getJumpgateCooldown(h) - (AGO.Time.timestamp() - Math.max(c, 1E4));
                            if (0 <= c) {
                                AGO.Planets.updateDisplayStatus = 5;
                                e = "ago_planets_cooldown" + (60 >= c ? " ago_planets_cooldown_seconds" : "");
                                f = 60 < c ? Math.ceil(c / 60) : Math.floor(c) || "";
                                (d = b.querySelector("#planet-" + a.planet + " .ago_planets_cooldown")
                                    ) ? (DOM.updateText(d, null, f), DOM.updateClass(d, null, e)
                                    ) : (d = b.querySelector("#planet-" + a.planet + " .moonlink")
                                    ) && DOM.appendSPAN(d, e, f)
                            } else {
                                AGO.Fleet.Get("Cooldown", h, 0, 2)
                            }
                    }
                });
            }
            AGO.Planets.coloring && AGO.Planets.Task.coords && AGO.Planets.Task.coordstype !== AGO.Planets.Task.coords + ":" + AGO.Planets.Task.type && DOM.iterateChildren(b, function (a) {
                    var b, c;
                    (b = STR.check(NMR.parseIntAbs(a.id))
                    ) && AGO.Planets.Data[b] && AGO.Planets.Data[b].coords === AGO.Planets.Task.coords &&
                    (3 !== AGO.Planets.Task.type || AGO.Planets.Data[b].moon || (AGO.Planets.Task.type = 1
                        ), c = AGO.Token.getClassSelected(AGO.Planets.Task.type)
                    );
                    DOM.setClassGroup(a, null, "ago_selected", c)
                }
            )
        }
        b = d = null
    },
    Get: function (a, b, d) {
        b = (a = AGO.Planets.GetId(a)
        ) && AGO.Planets.Data[a] && b ? AGO.Planets.Data[a][b] : "";
        return 6 === d ? STR.check(b) : +b || 0
    },
    GetByCoords: function (a, b, d) {
        return AGO.Planets.Get(AGO.Planets.ByCoords[a], b, d)
    },
    GetByIndex: function (a, b, d) {
        return AGO.Planets.Get(AGO.Planets.ByIndex[a], b, d)
    },
    GetId: function (a) {
        return a &&
        AGO.Planets.Data[a] ? a : "active" === a ? AGO.Acc.planetId : "selected" === a ? AGO.Planets.selectedPlanet : AGO.Planets.ByCoordstype[a] || ""
    },
    getHome: function () {
        var a;
        AGO.Planets.iterate(1, function (b, d) {
                if (!a || +d < a) {
                    a = +d
                }
            }
        );
        return a
    },
    owncoords: function (a, b) {
        return AGO.Planets.ByCoords[a] ? a === AGO.Acc.coords ? b === AGO.Acc.type ? 4 : AGO.Planets.ByCoordstype[a + ":" + b] ? 3 : 1 : AGO.Planets.ByCoordstype[a + ":" + b] ? 2 : 1 : 0
    },
    click: function (a) {
        var b;
        a && a.target && (a = "A" === a.target.nodeName ? a.target : "A" === a.target.parentNode.nodeName ? a.target.parentNode : null
        ) && (b = -1 < (a.className ||
                ""
            ).indexOf("moon") ? 3 : 1, DOM.removeClassGroup(a.parentNode, null, "ago_highlight"), DOM.extendClass(a.parentNode, null, AGO.Token.getClassHighlight(b, "active"))
        )
    },
    clickArrow: function (a) {
        a && a.target && (a = DOM.hasClass(a.target, null, "ago_planets_arrow_moon") ? 3 : DOM.hasClass(a.target, null, "ago_planets_arrow_planet") ? 1 : 0
        ) && AGO.Planets.Action({scroll: "down", type: a})
    },
    hover: function (a) {
        var b;
        a && a.target && (b = "A" === a.target.nodeName ? a.target : "A" === a.target.parentNode.nodeName ? a.target.parentNode : null
        ) && (a = "mouseover" ===
            a.type && -1 < (b.className || ""
            ).indexOf("moon") ? "ago_hover_S3" : "ago_hover_S1", DOM.setClassGroup(b.parentNode, null, "ago_hover", a)
        )
    },
    Action: function (task) {
        let newIndex, index;
        if (OBJ.is(task)) {
            AGO.Planets.switchTimeout && clearTimeout(AGO.Planets.switchTimeout);
            newIndex = index = AGO.Planets.selectedPlanet ? AGO.Planets.Get("selected", "index") : AGO.Planets.Get("active", "index");
            AGO.Planets.selectedPlanet && DOM.removeClassGroup(DOM.queryAll("#planetList .smallplanet")[newIndex-1], null, "ago_hovered");
            if (task.scroll) {
                task.type = task.type || AGO.Planets.selectedType || AGO.Acc.type;
                task.mode = "set";
                do {
                    if ("down" === task.scroll) {
                        newIndex++;
                        newIndex >= AGO.Planets.ByIndex.length && (newIndex = 1);
                    } else {
                        newIndex--;
                        1 > newIndex && (newIndex = AGO.Planets.ByIndex.length - 1);
                    }

                    let newPlanet;
                    if (1 === task.type) {
                        break;
                    } else if (newPlanet = AGO.Planets.ByIndex[newIndex], AGO.Planets.Data[newPlanet].moon) {
                        break;
                    }
                } while (newIndex !== index)
            }

            if ("set" === task.mode) {
                let newPlanet, delay = 0;
                newPlanet = document.querySelectorAll("#planetList .smallplanet a.planetlink")[newIndex - 1];

                if (task.wait && newPlanet) {
                    delay = 750;
                    AGO.Planets.selectedPlanet = 1 === task.type ? AGO.Planets.ByIndex[newIndex] : AGO.Planets.GetByIndex(newIndex, "moon", 6);
                    AGO.Planets.selectedType = task.type;
                    DOM.addClass(newPlanet.parentNode, null, "ago_hovered_S" + task.type);
                }

                if (newPlanet) {
                    AGO.Planets.switchTimeout = setTimeout(function () {
                        DOM.click(1 === task.type ? "a.planetlink" : "a.moonlink", newPlanet.parentNode);
                    }, delay);
                }
            } else if ("select" === task.mode && AGO.Planets.coloring) {
                AGO.Planets.Task.coords = task.coords;
                AGO.Planets.Task.type = task.type;
                AGO.Planets.Display();
            }
        }
    },
    iterate: function (a, b) {
        var d, c;
        for (c = 1; c < AGO.Planets.ByIndex.length; c++) {
            d = AGO.Planets.ByIndex[c], AGO.Planets.Data[d] && (a && 1 !== a || b(AGO.Planets.Data[d], d), d = AGO.Planets.Data[d].moon, !d || a && 3 !== a || b(AGO.Planets.Data[d], d)
            )
        }
    }
};
AGO.Panel = {
    displayStatus: 0,
    mouseStatus: false,
    mouseCount: 0,
    Data: {},
    Messages: function (a, b) {
        "Display" === a ? AGO.Panel.Display(b) : "updateTab" === a ? AGO.Panel.updateTab(b) : "Action" === a ? AGO.Panel.Action(b) : "hover" === a && AGO.Panel.hoverExtern(b)
    }, Timer: function () {
    }, Init: function (a, b) {
        AGO.Panel.Data = OBJ.is(a) ? a : {};
        b && (AGO.Panel.Display(), window.setTimeout(function () {
                    var a;
                    a = AGO.Background.Get("Panel_Target", 6).split("|");
                    AGO.Background.Set("Panel_Target", "");
                    AGO.Option.is("I81") && (a[0] || a[1]
                    ) && AGO.Init.Messages("Token",
                        "Action", {
                            action: "set",
                            tab: "Target",
                            token: 81,
                            coords: a[0],
                            time: a[1],
                            marked: 1
                        }
                    )
                }, 200
            )
        )
    }, Run: function () {
        AGO.Option.is("I00") && (AGO.Panel.enabled = !0, AGO.Panel.place = Math.ceil(Math.max((+document.body.clientWidth || 0
            ) - 1E3, 2
            ) / 2
            ), AGO.Option.is("I03") ? (AGO.Panel.width = Math.min(AGO.Option.get("I03", 2), AGO.Panel.place + 190), AGO.Panel.space = NMR.minMax(Math.ceil((AGO.Panel.place - AGO.Panel.width
                    ) / 2
                    ), 3, 40
                )
            ) : (AGO.Panel.space = NMR.minMax(Math.ceil((AGO.Panel.place - 220
                    ) / 3
                    ), 3, 40
                ), AGO.Panel.width = NMR.minMax(AGO.Panel.place -
                    4 - 2 * AGO.Panel.space, 190, 290
                )
            ), AGO.Panel.innerWidth = AGO.Panel.width - 8, AGO.Panel.left = -(AGO.Panel.width + AGO.Panel.space + 4
            ), AGO.Panel.slideLeft = -(AGO.Panel.place - 1
            ), AGO.Panel.height = NMR.minMax(AGO.Option.get("I04", 2) || (+window.innerHeight || 0
            ) - (AGO.Option.is("commander") ? 55 : 90
            ), 400, 1200
            ), AGO.Option.is("T00") || AGO.Panel.set("Tools", "label", ""), AGO.Panel.Show()
        );
        AGO.Box.Run()
    }, onSwipe: function (a) {
        "left" === a && window.setTimeout(function () {
                AGO.Panel.panelInactive(!0)
            }, 333
        );
        "right" === a && AGO.Panel.panelActive(3)
    },
    Show: function () {
        var a, b, d, c, e, f;
        if (a = document.getElementById("box")) {
            b = document.createDocumentFragment(), d = (AGO.Panel.left < AGO.Panel.slideLeft ? "ago_panel_slide " : ""
            ) + (OBJ.get(AGO.Styles.classVisible, AGO.Option.get("I02", 2)) || ""
            ), d = DOM.appendDIV(b, {
                    "class": d,
                    id: "ago_panel_button"
                }
            ), DOM.appendSPAN(d, "ago_panel_arrow"), f = DOM.appendDIV(b, {id: "ago_panel"}, {left: AGO.Panel.left + "px"}), c = DOM.appendDIV(f, {"class": "ago_panel_wrapper"}, {
                    width: AGO.Panel.width + "px",
                    minHeight: AGO.Panel.height + "px"
                }
            ), DOM.appendSPAN(c,
                "ago_panel_arrow"
            ), OBJ.iterate(AGO.Panel.Data, function (a) {
                    if (AGO.Panel.Get(a, "label", 6) && (e = DOM.appendDIV(c, {id: "ago_panel_" + a}), f = DOM.appendDIV(e, {
                                "class": "ago_panel_tab",
                                "ago-data": JSON.stringify({
                                        update: {
                                            tab: a,
                                            status: "toggle"
                                        }
                                    }
                                )
                            }
                        ), f.textContent = AGO.Label.get(AGO.Panel.Get(a, "label", 6)), DOM.appendSPAN(f, "ago_panel_tab_info"), DOM.appendDIV(e, "ago_panel_tab_header"), DOM.appendDIV(e, "ago_panel_tab_content"), DOM.appendDIV(e, "ago_panel_tab_footer"), AGO.Panel.Get(a, "status")
                    )) {
                        if ("Settings" === a) {
                            AGO.Panel.createSettings(e,
                                a, ""
                            );
                        } else {
                            AGO.Panel["create" + a](e, a, AGO.Panel.Get(a, "data", 6), AGO.Panel.Data.Cache);
                        }
                        DOM.updateClass(e, null, "ago_panel_tab_open")
                    }
                }
            ), DOM.appendSPAN(c, "ago_panel_arrow"), a.appendChild(b), AGO.Panel.updateTab(), DOM.addEventsAll("#ago_panel_button, #ago_panel .ago_panel_wrapper", null, {
                    click: AGO.Panel.click,
                    mouseover: AGO.Panel.hover,
                    mouseout: AGO.Panel.hover
                }
            );
        }
        a = b = d = c = e = f = null
    }, set: function (a, b, d, c) {
        a && b && AGO.Panel.Data[a] && (AGO.Panel.Data[a][b] = d, c || AGB.message("Panel", "Set", {
                    tab: a,
                    key: b,
                    value: d
                }
            )
        )
    }, Get: function (a,
                      b, d
    ) {
        a = a && AGO.Panel.Data[a] && b ? AGO.Panel.Data[a][b] : "";
        return 6 === d ? STR.check(a) : +a || 0
    },
    getActive: function (tab, prop, string) {
        let result;
        if (tab && AGO.Panel.Data[tab]) {
            result = OBJ.get(AGO.Panel.Data[tab].active, prop);
        } else {
            result = "";
        }

        if (6 === string) {
            return STR.check(result);
        } else {
            return +result || 0;
        }
    }, Display: function (a) {
        var b, d;
        if (5 < AGO.Init.status && !AGO.Panel.updateDisplayLock) {
            AGO.Panel.updateDisplayLock = !0;
            b = OBJ.parse(a);
            AGO.Panel.enabled && !b.tab && OBJ.iterate(AGO.Panel.Data, function (a) {
                    AGO.Panel.Get(a, "label", 6) && "Settings" !== a && AGO.Panel.Get(a, "status") && (b.tab = a
                    )
                }
            );
            if (b.tab && AGO.Panel.Data[b.tab]) {
                "Settings" !==
                b.tab && ("data" in b ? AGO.Panel.set(b.tab, "data", b.data) : b.data = AGO.Panel.Get(b.tab, "data", 6)
                );
                d = document.getElementById("ago_panel_" + b.tab);
                if (AGO.Panel.enabled && DOM.getChildren(d, 2)) {
                    b.status = "status" in b ? "toggle" !== b.status ? b.status : AGO.Panel.Get(b.tab, "status") ? 0 : 1 : 1;
                    AGO.Panel.set(b.tab, "status", b.status);
                    OBJ.iterate(AGO.Panel.Data, function (a) {
                            var d;
                            AGO.Panel.Get(a, "label", 6) && ((d = AGO.Panel.Get(a, "status")
                                ) && "Settings" !== a && "Settings" !== b.tab && a !== b.tab && (d = 0, AGO.Panel.set(a, "status", d)
                                ), DOM.updateClass("ago_panel_" +
                                    a, "id", d ? "ago_panel_tab_open" : ""
                                )
                            )
                        }
                    );
                    if ("Settings" !== b.tab) {
                        AGO.Panel["create" + b.tab](d, b.tab, b.data);
                    }
                    a && AGO.Panel.panelActive(2)
                }
                AGO.Panel.Get("Settings", "status") && AGO.Panel.createSettings(document.getElementById("ago_panel_Settings"), b.tab, b.data)
            }
            window.setTimeout(function () {
                    AGO.Panel.updateDisplayLock = !1
                }, 50
            )
        }
    }, updateTab: function (a) {
        var b;
        AGO.Init.status && (a = OBJ.get(a, "tab"), a && "Flights" !== a || (a = AGO.Fleet.Get("Current", "fleets"), (b = AGO.Fleet.Get("Current", "fleetsSlots")
                ) && DOM.updateText("#ago_panel_Flights .ago_panel_tab_info",
                    null, a + "/" + b
                )
            )
        )
    }, createSettings: function (a, b, d, c) {
        function e(a, b, d, c, e, f, t, y) {
            var w;
            w = AGO.Option.get(a, 2);
            b = AGO.Label.get(b || a);
            d = DOM.appendTR(g, e ? "ago_panel_content_disabled" : "", {setting: {id: a}, update: d, message: c});
            DOM.appendTD(d, b.length > h / 7 ? {
                "class": "tooltip",
                title: b
            } : null, (f ? "\u2009\u2009 " : "\u2022\u2009"
            ) + b
            );
            b = DOM.appendTD(d);
            b = DOM.append(b, "input", {type: t || "checkbox"}, null, {change: AGO.Panel.changeSetting});
            "radio" === t ? (b.name = "ago_panel_settings_" + a, b.checked = w === y, b.value = y
            ) : "text" === t ? b.value =
                w || "" : b.checked = Boolean(w)
        }

        function f(a, b, d, c, e) {
            var f, t, y;
            y = AGO.Option.get(a, 2);
            b && (b = AGO.Label.get(b), f = DOM.appendTR(g), t = b.length > h / 7 ? {
                    "class": "tooltip",
                    title: b
                } : null, t = DOM.appendTD(f, t), DOM.innerHTML(t, null, "&bull;&thinsp;" + b), DOM.appendTD(f)
            );
            f = DOM.appendTR(g, "ago_panel_settings_select", {setting: {id: a}, update: d, message: c});
            a = DOM.appendTD(f, {colspan: 2});
            DOM.appendSELECT(a, "dropdownInitialized", e, STR.zero(y), {change: AGO.Panel.changeSetting})
        }

        var g, h;
        h = AGO.Panel.innerWidth - 25;
        d = document.createDocumentFragment();
        g = DOM.appendTABLE(d, "ago_panel_settings", {width: AGO.Panel.innerWidth + "px"}, [h, 25]);
        if (c) {
            switch (b) {
                case "Account":
                    e("I21", "I21", {tab: b, data: ""}, "", "", "", "radio", 1);
                    e("I21", "I41", {tab: b, data: ""}, "", "", "", "radio", 2);
                    e("I22", "", {tab: b}, "", 2 === AGO.Option.get("I21", 2));
                    break;
                case "Flights":
                    e("I41", "I21", {tab: b, data: ""}, "", "", "", "radio", 1);
                    e("I41", "I41", {tab: b, data: ""}, "", "", "", "radio", 2);
                    e("I42", "I22", {tab: b}, "", 2 === AGO.Option.get("I41", 2));
                    break;
                case "Construction":
                    e("I31", "", {tab: b});
                    e("I32", "I22", {tab: b});
                    e("I35", "", {tab: b});
                    break;
                case "Target":
                    e("I82", "", {tab: b}, {page: "Main", role: "Display"});
                    e("I83", "", {tab: b}, {page: "Main", role: "Display"});
                    break;
                case "Tools":
                    e("T01", "", {tab: b}), e("", "T05")
            }
        } else {
            switch (AGO.App.page) {
                case "resources":
                case "station":
                case "research":
                    e("B11", "", {tab: "Settings"}, {page: "Page", role: "Display"});
                    e("B12", "", {tab: "Settings"}, {page: "Page", role: "Display"}, !AGO.Option.is("B11"), "indent");
                    break;
                case "shipyard":
                case "defense":
                    e("B11", "", {tab: "Settings"}, {page: "Page", role: "Display"});
                    break;
                case "fleet2":
                    e("F16");
                    break;
                case "fleet3":
                    e("F18");
                    break;
                case "movement":
                    e("E14");
                    break;
                case "messages":
                    e("M51", "", "", {page: "Page", role: "toggleSpiohelper"}), e("M53"), f("M30", "M30", "", {
                            page: "Page",
                            role: "changeStatus"
                        }, {
                            0: " - ",
                            1: "M31",
                            2: "M32",
                            3: "M33",
                            4: "M34",
                            5: "M35"
                        }
                    )
            }
        }
        DOM.replaceChildren(DOM.getChildren(a, 1), d);
        d = g = null
    }, changeSetting: function (a) {
        var b;
        a && a.currentTarget && (b = DOM.getData(a.currentTarget, null, 2), OBJ.is(b.setting) && (a = "checkbox" !== a.currentTarget.type ? +a.currentTarget.value || 0 :
                    a.currentTarget.checked ? 1 : 0, AGO.Option.set(b.setting.id, a, 2), OBJ.is(b.update) && AGO.Panel.Display(b.update), OBJ.is(b.message) && ("data" in b.message || (b.message.data = a
                    ), AGO.Init.Messages(b.message.page, b.message.role, b.message.data)
                )
            )
        )
    }, createAccount: function (a, b, d) {
        var c, e;
        d && AGO.Option.set("I21", 0, 2);
        2 === AGO.Option.get("I21", 2) ? c = "account" : (c = AGO.Planets.GetId(d) || AGO.Planets.GetId("active"), AGO.Option.is("I22") && (e = AGO.Planets.Get(c, "moon", 6) || AGO.Planets.Get(c, "planet", 6)
            )
        );
        AGB.message("Panel", "ListAccount",
            {planet: c, moon: e}, function (c) {
                var e, h, p, k, n, l, m, q, t, y;
                c && c.tab && (d && AGO.Option.set("I21", 0, 2), AGO.Panel.createSettings(a, b, d, "intern"), t = 2 === AGO.Option.get("I21", 2) ? "account" : AGO.Planets.GetId(d) || AGO.Planets.GetId("active"), y = "account" === t ? "account" : AGO.Planets.Get(t, AGO.Option.is("I22") ? "coords" : "coordstype", 6), e = document.createDocumentFragment(), h = DOM.appendTABLE(e, "ago_panel_overview", {width: AGO.Panel.innerWidth + "px"}, [
                            58,
                            AGO.Panel.innerWidth - 96,
                            38
                        ]
                    ), AGO.Planets.iterate(1, function (a, d) {
                            q = a.moon;
                            m = d === t ? "ago_color_planet" : q === t ? "ago_color_moon" : "";
                            p = DOM.appendTR(h, m, {tab: b, data: a.coordstype});
                            m = 9 <= a.coords.length ? "ago_panel_overview_coords_small" : "ago_panel_overview_coords";
                            DOM.appendTD(p, m, a.coords);
                            DOM.appendTD(p, "ago_panel_overview_name", a.name);
                            k = DOM.appendTD(p, "ago_panel_overview_status");
                            DOM.appendSPAN(k).style.backgroundColor = c.statusColor[d] || "#6A0A0A";
                            q && (DOM.setData(k, null, {
                                        tab: b,
                                        data: AGO.Planets.Data[q].coordstype
                                    }
                                ), DOM.appendSPAN(k).style.backgroundColor = c.statusColor[q] || "#6A0A0A",
                                    DOM.appendIMG(k, AGO.Planets.Data[q].img)
                            )
                        }
                    ), n = AGO.Events.calculate("ownership"), l = n[y] ? n[y].own : null, n = n[y] ? n[y].neutral : null, l && AGO.Option.is("I24") && (AGO.Task.addResources(c.Units, l), AGO.Task.addShips(c.Units, l)
                    ), n && AGO.Option.is("I26") && AGO.Task.addResources(c.Units, n), AGO.Panel.appendUnits(e, c.Units, "I27", !0, b, 3, 2), AGO.Panel.appendUnits(e, l, "I24", "I24", b, 2, 1, "ago_color_own"), AGO.Panel.appendUnits(e, n, "I26", "I26", b, 1, 0, "ago_color_neutral"), DOM.replaceChildren(DOM.getChildren(a, 2), e), e = h = p = k = null
                )
            }
        )
    },
    appendUnits: function (a, b, d, c, e, f, g, h) {
        function p(a, b, d, c, e) {
            a = DOM.appendLI(n, b, d, 10);
            0 < e ? DOM.appendSPAN(a, "ago_panel_content_value", c, 3) : (d = 0 > e ? "I0E" : "I0A", DOM.appendSPAN(a, {
                        "class": "tooltip ago_panel_content_value ago_panel_content_unavailable",
                        title: AGO.Label.get("I0B")
                    }, d, 10
                )
            );
            return a
        }

        function k(a, b, d, c) {
            for (var e in d) {
                if (b[e] || c) {
                    d = DOM.appendLI(a, "", e, 11), DOM.appendSPAN(d, "ago_panel_content_value", b[e], 2)
                }
            }
        }

        var n, l, m, q;
        if (b) {
            q = "string" === typeof c ? AGO.Option.is(c) : c;
            n = document.createElement("ul");
            n.className = "ago_panel_content";
            m = q ? "ago_panel_content_header" : "ago_panel_content_header ago_panel_content_disabled";
            m = h ? m + " " + h : m;
            f && (2 <= f || b.resources || b.timeShip
            ) && (l = p(n, m, d, b.resources, b.timeResource), "string" === typeof c && (DOM.setData(l, null, {
                            setting: {id: c},
                            update: {tab: e}
                        }
                    ), DOM.append(l, "input", {type: "checkbox"}, {display: "none"}, {change: AGO.Panel.changeSetting}, {checked: Boolean(q)})
                ), q && b.timeResource && (3 <= f || b.resources
                ) && k(n, b, AGO.Item.Resource, 3 <= f)
            );
            if (g && q) {
                if (2 <= g || b.shipsCivil) {
                    l = p(n, m,
                        "I28", b.shipsCivil, b.timeShip
                    ), b.shipsCivil && k(n, b, AGO.Item.ShipCivil);
                }
                if (2 <= g || b.shipsCombat) {
                    l = p(n, m, "I29", b.shipsCombat, b.timeShip), b.shipsCombat && k(n, b, AGO.Item.ShipCombat)
                }
            }
            l && a.appendChild(n)
        }
        n = l = null
    }, createFlights: function (a, b, d) {
        function c(a, b, d) {
            DOM.appendSPAN(a, OBJ.get(AGO.Styles.classFleet, d), b && b.fleets ? b.fleets : "\u2009\u2009")
        }

        var e, f, g, h, p, k, n, l, m, q;
        d && AGO.Option.set("I41", 0, 2);
        AGO.Panel.createSettings(a, b, d, "intern");
        e = document.createDocumentFragment();
        f = DOM.appendTABLE(e, "ago_panel_overview",
            {width: AGO.Panel.innerWidth + "px"}, [58, AGO.Panel.innerWidth - 130, 72]
        );
        k = AGO.Events.calculate("flights");
        if (k.account) {
            if (q = 2 !== AGO.Option.get("I41", 2) && AGO.Option.is("I42"), d = k[d] ? d : "", m = 2 === AGO.Option.get("I41", 2) ? "account" : AGO.Planets.Get(d || "active", "coordstype", 6) || d, l = "account" === m ? "account" : q ? AGO.Task.cutCoords(m) : m, AGO.Planets.iterate(0, function (a) {
                    if (p = k[a.coordstype]) {
                        n = l === a.coords || m === a.coordstype ? HTML.classType(a.type) : "", g = DOM.appendTR(f, n, {
                                tab: b,
                                data: a.coordstype
                            }
                        ), n = 9 <= a.coords.length ?
                            "ago_panel_overview_coords_small" : "ago_panel_overview_coords", h = DOM.appendTD(g, n, a.coords), n = m === a.coordstype ? "ago_panel_overview_name" : "ago_panel_overview_name ago_color_normal", h = DOM.appendTD(g, n), 3 === a.type && DOM.appendIMG(h, a.img, "11px"), DOM.appendTEXT(h, a.name), h = DOM.appendTD(g, "ago_panel_fleets"), c(h, p.hostile, 1), c(h, p.neutral, 2), c(h, p.back, 4), c(h, p.own, 3)
                    }
                }
            ), l && k[l]) {
                if ("account" === l || q) {
                    g = DOM.append(e, "ul", "ago_panel_content"), h = DOM.appendLI(g, "ago_panel_content_header", "I47", 10), d = DOM.appendSPAN(h,
                        "ago_panel_content_value ago_panel_fleets"
                    ), c(d, k[l].hostile, 1), c(d, k[l].neutral, 2), c(d, k[l].back, 4), c(d, k[l].own, 3), c(d, k[l].friend, 5), c(d, k[l].enemy, 6);
                }
                AGO.Panel.appendUnits(e, k[l].own, "I24", !0, b, 2, 1, "ago_color_own");
                AGO.Panel.appendUnits(e, k[l].back, "I25", !0, b, 2, 1, "ago_color_reverse");
                AGO.Panel.appendUnits(e, k[l].neutral, "I26", !0, b, 1, 1, "ago_color_neutral");
                AGO.Panel.appendUnits(e, k[l].hostile, "I26", !0, b, 0, 1, "ago_color_hostile")
            }
        } else {
            g = DOM.appendTR(f), h = DOM.appendTD(g, {colspan: 3}), h.style.textAlign =
                "right", DOM.appendSPAN(h, {
                    "class": "tooltip ago_panel_content_unavailable",
                    title: AGO.Label.get("I0D")
                }, "I0C", 10
            );
        }
        DOM.replaceChildren(DOM.getChildren(a, 2), e);
        e = f = g = h = d = null
    }, createConstruction: function (a, b, d, c) {
        function e(a) {
            var b;
            b = Math.max(a.level + a.increase, 200 > a.id ? 0 : 1);
            return (a = VAL.status(a.increase, -1 * a.range, 0, a.range)
            ) ? b + "-" + (b + a
            ) : b || "0"
        }

        function f(a, b, d, c, e, f, g, p) {
            var l, n, m;
            m = {metal: 0, crystal: 0, deuterium: 0, resources: 0};
            for (n in AGO.Item.Resource) {
                if (0 < k[n] || !k.resources) {
                    m[n] = b ? +b[n] || 0 : 0, m.resources +=
                        m[n];
                }
            }
            if (e || m.resources) {
                if (e = "string" === typeof c ? AGO.Option.is(c) : c, d && (l = e ? "ago_panel_content_header" : "ago_panel_content_header ago_panel_content_disabled", d = DOM.appendLI(a, p ? l + " " + p : l, d, 10), p = b && b.timeResource ? DOM.appendSPAN(d, "ago_panel_content_value", m.resources, 3) : DOM.appendSPAN(d, {
                            "class": "tooltip ago_panel_content_value ago_panel_content_unavailable",
                            title: AGO.Label.get("I0B")
                        }, "I0A", 10
                    ), "string" === typeof c && (DOM.setData(d, null, {
                                setting: {id: c},
                                update: {tab: "Construction"}
                            }
                        ), DOM.append(p, "input",
                            {type: "checkbox"}, {display: "none"}, {change: AGO.Panel.changeSetting}, {checked: Boolean(e)}
                        )
                    )
                ), m && m.resources && e && b.timeResource) {
                    for (n in AGO.Item.Resource) {
                        m[n] && (e && f && (h[n] = Math.max(h[n] - (m[n] || 0
                                ), 0
                                )
                            ), l = e ? "" : "ago_panel_content_disabled", d = DOM.appendLI(a, l, n, 11), l = g ? 0 < h[n] ? "ago_panel_content_value ago_color_palered" : "ago_panel_content_value ago_color_lightgreen" : "ago_panel_content_value", DOM.appendSPAN(d, l, m[n], 2)
                        )
                    }
                }
            }
        }

        var g, h, p, k, n, l, m, q, t;
        AGO.Panel.createSettings(a, b, "", "intern");
        k = {
            metal: 0, crystal: 0,
            deuterium: 0, resources: 0, count: 0
        };
        AGO.Task.updateCoordsType(k, d);
        n = OBJ.create(k);
        p = OBJ.create(k);
        p.routine = 2;
        q = AGO.Option.is("I31");
        t = AGO.Option.is("I35");
        l = k.coordstype;
        m = AGO.Option.is("I32") ? k.coords : l;
        c = {active: AGO.Acc.planetId};
        t ? c.planet = "account" : (c.planet = AGO.Planets.GetId(l), AGO.Option.is("I32") && (c.moon = AGO.Planets.Get(c.planet, "moon", 6) || AGO.Planets.Get(c.planet, "planet", 6)
            )
        );
        AGB.message("Construction", "List", c, function (c) {
                var w, s, u, A, D, x, r, F, v, B, z, C, E;
                c = c || {};
                E = c.list || {};
                w = document.createDocumentFragment();
                s = DOM.appendTABLE(w, "ago_panel_overview", {width: AGO.Panel.innerWidth + "px"}, [
                        58,
                        AGO.Panel.innerWidth - 96,
                        38
                    ]
                );
                AGO.Planets.iterate(0, function (a) {
                        z = a.coordstype;
                        if (OBJ.is(E[z])) {
                            for (C = 0; C < E[z].length; C++) {
                                if (v = "", r = E[z][C]) {
                                    if (m === a.coords || l === a.coordstype) {
                                        if (d === a.coordstype + ":" + C && (r.selected = 1, OBJ.copy({
                                                    id: r.id,
                                                    level: r.level,
                                                    increase: r.increase,
                                                    range: r.range,
                                                    reserved: r.reserved
                                                }, k
                                            )
                                        ), OBJ.iterate(AGO.Item.Resource, function (a) {
                                                if (r[a]) {
                                                    if (r.reserved) {
                                                        n[a] += r[a], r.selected && !q && (k[a] = r[a]
                                                        );
                                                    } else if (r.selected ||
                                                        q) {
                                                        k[a] += r[a]
                                                    }
                                                }
                                            }
                                        ), v = r.reserved ? "ago_color_reserved" : "", r.selected || q) {
                                            k.count++, v = v || HTML.classType(a.type);
                                        }
                                    }
                                    u = DOM.appendTR(s, v, {
                                            tab: b,
                                            data: a.coordstype + ":" + C
                                        }
                                    );
                                    A = DOM.appendTD(u, "ago_panel_overview_coords", a.coords);
                                    v = r.selected ? "ago_panel_overview_name" : "ago_panel_overview_name ago_color_normal";
                                    A = DOM.appendTD(u, v);
                                    3 === a.type && DOM.appendIMG(A, HTML.urlTypeIcon(3), "11px");
                                    DOM.appendTEXT(A, r.id, 11);
                                    v = 200 > r.id ? "ago_panel_overview_count " + HTML.classStatus(r.increase) : "ago_panel_overview_count ago_color_normal";
                                    A = DOM.appendTD(u, v);
                                    r.reserved && (B = 0 > r.increase ? "icon_reserved_red.gif" : "icon_reserved.gif", DOM.appendIMG(A, HTML.urlImage(B), "11px")
                                    );
                                    DOM.appendTEXT(A, e(r))
                                }
                            }
                        }
                    }
                );
                k.count && (AGO.Task.updateResources(k), AGO.Task.updateResources(n), h = OBJ.create(k), s = DOM.append(w, "ul", "ago_panel_content"), v = k.reserved ? "ago_panel_content_action ago_panel_content_reserved" : "ago_panel_content_action", u = DOM.appendLI(s, v), v = 0 > k.increase ? "ago_icon_reserved_red" : "ago_icon_reserved", DOM.appendA(u, v, null, {
                            action: {
                                action: "reserve",
                                tab: b,
                                value: d
                            }
                        }
                    ), DOM.appendA(u, "icon icon_skip_back", null, {
                            action: {
                                action: "decreaseRange",
                                tab: b,
                                value: d
                            }
                        }
                    ), DOM.appendA(u, "icon icon_rewind", null, {
                            action: {
                                action: "decrease",
                                tab: b,
                                value: d
                            }
                        }
                    ), v = 200 > k.id ? HTML.classStatus(k.increase) : "ago_color_normal", DOM.appendSPAN(u, v, e(k)), DOM.appendA(u, "icon icon_fastforward", null, {
                            action: {
                                action: "increase",
                                tab: b,
                                value: d
                            }
                        }
                    ), DOM.appendA(u, "icon icon_skip", null, {
                            action: {
                                action: "increaseRange",
                                tab: b,
                                value: d
                            }
                        }
                    ), DOM.appendA(u, "icon icon_delete", null, {
                            action: {
                                action: "remove",
                                tab: b, value: d
                            }
                        }
                    ), F = 1 < k.count ? "I3B" : k.reserved ? "I37" : "I3A", f(s, k, F, !0, "always"), t && (s = DOM.append(w, "ul", "ago_panel_content"), DOM.appendLI(s, "ago_panel_content_action", "Account")
                    ), x = c.Units || {}, f(s, x, "I23", "I33", "always", "reduce", "colorize", "ago_color_stationed"), g = AGO.Events.calculate("ownership"), z = t ? "account" : m, x = g[z] && OBJ.is(g[z].own) ? g[z].own : {}, x.timeResource = g.account ? 1 : 0, f(s, x, "I24", "I34", "", "reduce", "colorize", "ago_color_own"), x = g[z] && OBJ.is(g[z].neutral) ? g[z].neutral : {}, x.timeResource = g.account ?
                        1 : 0, f(s, x, "I26", "I36", "", "reduce", "colorize", "ago_color_neutral"), f(s, n, "I37", "I37", "", "reduce", "colorize", "ago_color_reserved"), l === AGO.Acc.coordstype || t || (s = DOM.append(w, "ul", "ago_panel_content"), x = c.Active || {}, AGO.Option.is("I38") && (p.mode = !0, OBJ.iterate(AGO.Item.Resource, function (a) {
                                    p[a] = Math.max(Math.min(h[a], x[a]), 0);
                                    p.resources += p[a]
                                }
                            )
                        ), f(s, x, "I38", "I38", "always", "reduce", "colorize"), v = p.mode ? "ago_panel_content_header" : "ago_panel_content_header ago_panel_content_disabled", u = DOM.appendLI(s,
                            v
                        ), B = AGO.Uni.path + "fleet1", OBJ.iterateFilter(p, function (a) {
                                B += STR.addParameter(a, p[a])
                            }, "galaxy system position type metal crystal deuterium routine".split(" ")
                        ), D = DOM.appendA(u, {
                                "class": "btn_blue",
                                href: B
                            }, null, null, !p.mode
                        ), DOM.appendTEXT(D, "F60", 10), DOM.appendSPAN(u, "ago_panel_content_value", p.resources, 2), f(s, p, "", p.mode, "always", "", "colorize")
                    ), q && k.resources || !k.reserved
                ) && (s = DOM.append(w, "ul", "ago_panel_content"), f(s, h, "I39", !0, "always", "", "colorize"), AGO.Task.updateResources(h), h.resources &&
                    (DOM.appendLI(s), x = {
                            202: 0,
                            203: 0,
                            209: 0,
                            214: 0
                        }, OBJ.iterate(x, function (a) {
                                r = {action: 10};
                                r[a] = Math.ceil(h.resources / AGO.Ogame.getShipCapacity(a));
                                u = DOM.appendLI(s, {
                                        "ago-data": JSON.stringify({
                                                message: {
                                                    page: ["Fleet1"],
                                                    role: "Action",
                                                    data: r
                                                }
                                            }
                                        )
                                    }, a, 11
                                );
                                D = DOM.appendSPAN(u, "ago_panel_content_value", r[a], 2)
                            }
                        )
                    )
                );
                DOM.replaceChildren(DOM.getChildren(a, 2), w);
                w = s = u = A = D = null
            }
        )
    }, createAlliance: function (a, b, d, c) {
        function e(b) {
            var d, c, e;
            b && b.tab && (e = AGO.Panel.getActive("Alliance", "id", 6), d = document.createDocumentFragment(), c =
                    AGO.Panel.appendTable(d), AGO.Panel.appendToken(c, "Alliance", b.token, b.listTab), c = AGO.Panel.appendTable(d), AGO.Panel.appendAlliance(c, "Alliance", b.token, e, b.listToken), DOM.replaceChildren(DOM.getChildren(a, 2), d)
            )
        }

        OBJ.get(c, "tab") === b ? e(c) : AGB.message("Token", "List", {tab: b, token: +d || 0}, e)
    }, createPlayer: function (a, b, d, c) {
        function e(b) {
            var d, c, e;
            b && b.tab && (e = AGO.Panel.getActive("Player", "id", 6), d = document.createDocumentFragment(), c = AGO.Panel.appendTable(d), AGO.Panel.appendToken(c, b.tab, b.token, b.listTab),
                    c = AGO.Panel.appendTable(d), AGO.Panel.appendPlayer(c, b.token, e, b.listToken), DOM.replaceChildren(DOM.getChildren(a, 2), d)
            )
        }

        "Player" === OBJ.get(c, "tab") ? e(c) : AGB.message("Token", "List", {
                tab: "Player",
                token: AGO.Panel.Get("Player", "data")
            }, e
        )
    }, createTarget: function (a, b, d, c) {
        function e(b) {
            var d, c, e;
            b && b.tab && (e = AGO.Panel.getActive("Target", "id", 6), d = document.createDocumentFragment(), c = AGO.Panel.appendTable(d), AGO.Panel.appendToken(c, "Target", b.token, b.listTab), c = AGO.Panel.appendTable(d), AGO.Panel.appendTarget(c,
                    b.token, e, b.listToken
                ), DOM.replaceChildren(DOM.getChildren(a, 2), d)
            )
        }

        var f, g, h;
        AGO.Panel.createSettings(a, b, "", "intern");
        (f = DOM.getChildren(a, 3)
        ) && 0 === DOM.hasChildren(f) && (g = DOM.appendTABLE(null, "ago_panel_settings", {width: AGO.Panel.innerWidth + "px"}), h = DOM.appendTR(g), h = DOM.appendTD(h), DOM.append(h, "textarea", {
                    id: "ago_panel_textparser",
                    "class": "markItUpEditor"
                }, null, {
                    dblclick: AGO.Panel.parseTarget,
                    blur: AGO.Panel.parseTarget
                }
            ), f.appendChild(g)
        );
        OBJ.get(c, "tab") === b ? e(c) : AGB.message("Token", "List", {
                tab: b,
                token: +d || 0, sort: AGO.Option.get("I84")
            }, e
        )
    }, appendToken: function (a, b, d, c) {
        var e;
        OBJ.iterate(c, function (f) {
                var g, h;
                80 < f && !e && (e = !0, g = DOM.appendTR(a, {colspan: 3}), DOM.append(g, "TD", null, {
                            height: "10px",
                            lineHeight: "10px"
                        }
                    )
                );
                0 < c[f] && (h = +f === d ? HTML.classType(1) : "", g = {
                        tab: b,
                        data: f
                    }, g = DOM.appendTR(a, h, g), DOM.appendTD(g, "ago_panel_overview_coords"), DOM.appendTD(g, "ago_panel_overview_name " + AGO.Token.getClass(f), AGO.Token.getLabel(f)), DOM.appendTD(g, "ago_panel_overview_count", Math.max(c[f], 0))
                )
            }
        );
        2 > DOM.hasChildren(a) &&
        DOM.setStyleDisplay(a)
    }, appendAlliance: function (a, b, d, c, e) {
        var f;
        f = DOM.appendTR(a);
        DOM.appendTD(f, "ago_panel_overview_coords");
        DOM.appendTD(f, "ago_panel_overview_name", "\u2207");
        f = DOM.appendTD(f, "ago_panel_overview_count");
        DOM.appendA(f, "icon icon_delete", "", {action: {action: "icon", tab: "Alliance", icon: "remove"}});
        OBJ.iterateArray(e, function (e) {
                if (OBJ.is(e)) {
                    var f, p;
                    p = c === e.id ? HTML.classType(1) : "";
                    f = {action: {action: "toggle", tab: b, token: d, id: e.id}};
                    f = DOM.appendTR(a, p, f);
                    DOM.appendTD(f, "ago_panel_overview_coords");
                    DOM.appendTD(f, "ago_panel_overview_name", e.name || e.id);
                    p = DOM.appendTD(f, "ago_panel_overview_count");
                    "remove" === AGO.Panel.Get("Alliance", "icon", 6) && (f = {
                            message: {
                                page: "Token",
                                role: "Action",
                                data: {action: "remove", tab: "Alliance", token: d, id: e.id}
                            }
                        }, DOM.appendA(p, "icon icon_delete", "", f)
                    )
                }
            }
        );
        2 > DOM.hasChildren(a) && DOM.setStyleDisplay(a)
    }, appendPlayer: function (a, b, d, c) {
        var e;
        e = DOM.appendTR(a);
        DOM.appendTD(e, "ago_panel_overview_coords");
        DOM.appendTD(e, "ago_panel_overview_name", "\u2207");
        e = DOM.appendTD(e, "ago_panel_overview_count");
        DOM.appendA(e, "icon icon_delete", "", {action: {action: "icon", tab: "Player", icon: "remove"}});
        OBJ.iterateArray(c, function (c) {
                if (OBJ.is(c)) {
                    var e, h;
                    h = d === c.id ? HTML.classType(1) : "";
                    e = {action: {action: "toggle", tab: "Player", token: b, id: c.id}};
                    e = DOM.appendTR(a, h, e);
                    DOM.appendTD(e, "ago_panel_overview_coords");
                    DOM.appendTD(e, "ago_panel_overview_name", c.name || c.id);
                    h = DOM.appendTD(e, "ago_panel_overview_count");
                    "remove" === AGO.Panel.Get("Player", "icon", 6) && (e = {
                            message: {
                                page: "Token", role: "Action", data: {
                                    action: "remove",
                                    tab: "Player", token: b, id: c.id
                                }
                            }
                        }, DOM.appendA(h, "icon icon_delete", "", e)
                    )
                }
            }
        );
        2 > DOM.hasChildren(a) && DOM.setStyleDisplay(a)
    }, appendTable: function (a) {
        return DOM.appendTABLE(a, "ago_panel_overview", {width: AGO.Panel.innerWidth + "px"}, [
                60,
                AGO.Panel.innerWidth - 85,
                25
            ]
        )
    }, appendTarget: function (a, b, d, c) {
        var e, f, g, h;
        h = AGO.Option.get("I84", 2);
        g = AGO.Option.get("I85", 2);
        2 === h && 10 > g && (h = 1
        );
        e = DOM.appendTR(a);
        f = DOM.appendTD(e, "ago_panel_overview_coords", ["", "\u2207", "\u2207 " + g][h]);
        DOM.setData(f, null, {
                action: {
                    action: "sort",
                    tab: "Target", value: 1 === h ? 2 : 1
                }
            }
        );
        f = DOM.appendTD(e, "ago_panel_overview_name", h ? "" : "\u2207");
        DOM.setData(f, null, {action: {action: "sort", tab: "Target", value: 0}});
        f = DOM.appendTD(e, "ago_panel_overview_count");
        DOM.appendA(f, "icon icon_delete", "", {action: {action: "icon", tab: "Target", icon: "remove"}});
        OBJ.iterateArray(c, function (c) {
                if (OBJ.is(c)) {
                    var e, f, l;
                    l = STR.check(c.coords).split(":");
                    if (2 > h || AGO.Acc.galaxy === +l[0] && NMR.isMinMax(+l[1], AGO.Acc.system - g, AGO.Acc.system + g)) {
                        l = +l[3] || 1, f = d === c.id ? HTML.classType(l) :
                            "", e = {
                            tab: "Target",
                            data: b,
                            action: {action: "toggle", tab: "Target", token: b, id: c.id}
                        }, e = DOM.appendTR(a, f, e), DOM.appendTD(e, "ago_panel_overview_coords", AGO.Task.cutCoords(c.coords)), f = DOM.appendTD(e, "ago_panel_overview_name"), 1 < l && DOM.appendIMG(f, HTML.urlTypeIcon(l), "11px"), c.time ? DOM.appendTEXT(f, c.time, 17) : DOM.appendTEXT(f, c.name), f = DOM.appendTD(e, "ago_panel_overview_count"), "remove" === AGO.Panel.Get("Target", "icon", 6) && (e = {
                                message: {
                                    page: "Token", role: "Action", data: {
                                        action: "remove", tab: "Target", token: b,
                                        id: c.id
                                    }
                                }
                            }, DOM.appendA(f, "icon icon_delete", "", e)
                        )
                    }
                }
            }
        );
        2 > DOM.hasChildren(a) && DOM.setStyleDisplay(a)
    }, parseTarget: function (a) {
        a && a.target && ("dblclick" === a.type ? a.target.value = "" : (a = AGO.Task.parseTarget(a.target.value), (a.coords || a.time
                ) && AGO.Token.Action({
                        action: "set",
                        tab: "Target",
                        coords: a.coordstype || a.coords,
                        time: a.time,
                        token: 81,
                        marked: 1
                    }
                )
            )
        )
    }, createTools: function (a, b) {
        var d, c, e, f, g, h, p;
        if (AGO.Option.is("T00")) {
            AGO.Panel.createSettings(a, b, "", "intern");
            d = document.createDocumentFragment();
            for (h = 1; 9 >=
            h; h++) {
                c = document.createElement("ul");
                c.className = "ago_panel_links";
                DOM.appendLI(c, "ago_panel_links_header", "T" + h + "0", 10);
                for (p = 0; p < AGO.Tools.List.length; p++) {
                    g = "T" + h + AGO.Tools.List[p], AGO.Option.is(g) && (e = DOM.appendLI(c), f = {
                            message: {
                                page: "Tools",
                                role: "Action",
                                data: {tab: "Player", id: g}
                            }
                        }, DOM.appendA(e, "", null, f).textContent = AGO.Option.getPair(g)[0] || AGO.Label.get(g)
                    );
                }
                1 < DOM.hasChildren(c) && d.appendChild(c)
            }
            DOM.replaceChildren(DOM.getChildren(a, 2), d)
        }
    }, Action: function (a) {
        var b, d;
        b = OBJ.get(a, "tab");
        "Construction" ===
        b ? AGB.message("Construction", "Action", {
                action: a.action,
                value: a.value,
                coords: AGO.Acc.coordstype
            }, AGO.Panel.Display
        ) : VAL.check(b, "Alliance", "Player", "Target") && ("sort" === a.action ? (AGO.Option.set("I84", a.value, 2), AGO.Panel.Display()
            ) : "icon" === a.action ? (a.icon = AGO.Panel.Get(b, "icon", 6) === a.icon ? "" : a.icon, AGO.Panel.set(b, "icon", a.icon, !0), AGO.Init.Messages("Main", "Display"), AGO.Panel.Display()
            ) : 2 === a.marked || a.marked && !AGO.Option.is("I82") ? AGO.Panel.Display({
                    tab: b,
                    data: a.token
                }
            ) : ("toggle" === a.action &&
                (a.action = AGO.Panel.getActive(b, "id", 6) === a.id ? "deselect" : "select", "Target" === b && VAL.check(AGO.App.page, "fleet1", "fleet2") && (a.action = "select"
                    )
                ), d = VAL.check(a.action, "remove", "deselect") ? "" : a.id, AGB.message("Token", "Get", {
                        tab: b,
                        token: a.token,
                        id: d
                    }, function (c) {
                        var d;
                        AGO.Panel.set(b, "active", c);
                        AGO.Panel.Display({
                                tab: b,
                                data: a.token
                            }
                        );
                        d = {arrival: +OBJ.get(c, "time") || 0};
                        AGO.Task.updateCoordsType(d, OBJ.get(c, "coords"));
                        OBJ.copy(d, a);
                        "Player" === b ? AGO.Init.Messages("Box", "Action", {tab: b}) : "Target" === b && (AGO.Init.Messages("Main",
                                "Display"
                            ), AGO.Init.Messages([
                                    "Fleet1",
                                    "Fleet2",
                                    "Fleet3"
                                ], "Action", d
                            )
                        );
                        AGO.Init.Messages(["Galaxy"], "Action", a)
                    }
                )
            )
        )
    }, click: function (a) {
        var b;
        if (a && a.target) {
            b = DOM.getData(a.target, null, 2);
            if (AGO.Panel.updateDisplayLock || a.target.hasAttribute("disabled")) {
                return a.stopPropagation(), a.preventDefault(), !1;
            }
            OBJ.is(b.setting) ? "INPUT" !== a.target.nodeName && DOM.click("input", "LI" === a.target.nodeName ? a.target : a.target.parentNode) : (OBJ.is(b.message) && ("Tools" === b.message.page && OBJ.set(b.message.data, "shiftKeys",
                        a.shiftKey || a.ctrlKey
                    ), AGO.Init.Messages(b.message.page, b.message.role, b.message.data)
                ), OBJ.is(b.action) ? AGO.Panel.Action(b.action) : OBJ.is(b.update) ? AGO.Panel.Display(b.update) : b.tab && AGO.Panel.Display(b), "ago_panel_button" === a.target.id || "ago_panel_arrow" === a.target.className ? (a = DOM.getAttribute("ago_panel_button", "id", "ago_display_status", 2), 2 <= a ? AGO.Panel.panelInactive(!0) : AGO.Panel.panelActive(3)
                ) : AGO.Panel.panelActive(2)
            )
        }
    }, hover: function (a) {
        var b;
        a && a.target && (b = AGO.Panel.hoverStatus, AGO.Panel.mouseStatus =
                "mouseover" === a.type, AGO.Panel.mouseStatus && (!AGO.Option.is("I02") && VAL.check("ago_panel_button", a.target.id, a.target.parentNode.id) || AGO.Panel.panelActive(1), AGO.Panel.hoverStatus = 2 > AGO.Panel.displayStatus ? 1 : "ago_panel_button" === a.target.id || "ago_panel_arrow" === a.target.className ? 1 : 0
            ), b !== AGO.Panel.hoverStatus && DOM.updateAttribute("ago_panel_button", "id", "ago_hover_status", b, 8)
        )
    }, hoverExtern: function (a) {
        AGO.Panel.enabled && 2 <= AGO.Panel.displayStatus && (AGO.Panel.mouseStatus = Boolean(a)
        )
    }, panelActive: function (a) {
        AGO.Panel.displayStatus =
            AGO.Panel.displayStatus || DOM.getAttribute("ago_panel_button", "id", "ago_display_status", 2);
        AGO.Panel.enabled && AGO.Panel.displayStatus < a && (0 >= AGO.Panel.mouseCount && window.setTimeout(AGO.Panel.panelInactive, 500), AGO.Panel.mouseCount = 5, AGO.Panel.displayStatus = a, AGO.Panel.slideLeft = -(Math.ceil(Math.max((+document.body.clientWidth || 0
                ) - 1E3, 2
                ) / 2
                ) - 1
            ), 2 <= a && AGO.Panel.left < AGO.Panel.slideLeft && DOM.updateStyle("ago_panel", "id", "left", AGO.Panel.slideLeft + "px"), DOM.updateAttribute("ago_panel_button", "id", "ago_display_status",
                NMR.minMax(a, 0, 2), 8
            )
        )
    }, panelInactive: function (a) {
        AGO.Panel.enabled && (AGO.Panel.mouseStatus || AGO.Panel.mouseCount--, a || 0 >= AGO.Panel.mouseCount && 3 > AGO.Panel.displayStatus ? (AGO.Panel.displayStatus = 0, DOM.updateAttribute("ago_panel_button", "id", "ago_display_status", 0, 8), DOM.updateStyle("ago_panel", "id", "left", AGO.Panel.left + "px")
            ) : 3 > AGO.Panel.displayStatus && window.setTimeout(AGO.Panel.panelInactive, 500)
        )
    }
};
AGO.Box = {
    Data: {},
    Current: 0,
    Messages: function (a, b) {
        "Action" === a && AGO.Box.Action(b)
    }, Init: function (a, b) {
        AGO.Box.enabled = !0;
        AGO.Box.Data = OBJ.is(a) ? a : {};
        b && AGO.Box.Display()
    }, Run: function () {
        var a;
        a = AGO.Panel.Get("Box", "data", 6);
        AGO.Box.enabled && a && (OBJ.get(AGO.Box.Data.Cache, "tab") ? AGO.Box.Show(AGO.Box.Data.Cache) : AGO.Box.Display()
        )
    }, Show: function (a) {
        var b, d, c, e, f, g;
        if (a && a.playerName && Array.isArray(a.planets)) {
            d = document.createDocumentFragment();
            for (b = 0; b < a.planets.length; b++) {
                if (e = a.planets[b]) {
                    f = AGO.Task.splitCoords(e.coords),
                        f.tab = "Target", f.id = e.coords, f.type = 1, f.action = "set", g = "&galaxy=" + f.galaxy + "&system=" + f.system + "&position=" + f.position, c = e.planetId === a.planetHome ? "ago_box_homeplanet" : "", c = DOM.appendDIV(d, c), "galaxy" === AGO.App.page ? DOM.appendA(c, null, null, {
                            message: {
                                page: "Page",
                                role: "Action",
                                data: f
                            }
                        }
                    ).textContent = e.coords : DOM.appendA(c, {href: "index.php?page=galaxy" + g}).textContent = e.coords, VAL.check(AGO.App.page, "fleet1", "fleet2", "fleet3") ? (DOM.appendA(c, null, null, {
                                message: {
                                    page: "Page",
                                    role: "Action",
                                    data: f
                                }
                            }
                        ).textContent =
                            e.planetName, e.moonId && (f.type = 3, c = DOM.appendA(c, null, null, {
                                    message: {
                                        page: "Page",
                                        role: "Action",
                                        data: f
                                    }
                                }
                            ), DOM.appendIMG(c, HTML.urlTypeIcon(3, "a"), "14px")
                        )
                    ) : (DOM.appendA(c, {href: "index.php?page=fleet1" + g + "&type=1"}).textContent = e.planetName, e.moonId && (c = DOM.appendA(c, {href: "index.php?page=fleet1" + g + "&type=3"}), DOM.appendIMG(c, HTML.urlTypeIcon(3, "a"), "14px")
                        )
                    );
                }
            }
            e = a.playerName + "|Planets: " + a.planets.length + "<BR>";
            let galaxyIconFunction = AGO.Option.get("O71");
            (b = document.getElementById("ago_box")
            ) ? (DOM.setAttribute("ago_box_title", "id", "title", e),
                    DOM.setText("ago_box_title", "id", a.playerName), DOM.replaceChildren(document.getElementById("ago_box_content"), d), DOM.setStyleDisplay(b, null, "block")
            ) : d && (b = DOM.appendDIV(null, {
                        "class": "ago_box",
                        id: "ago_box"
                    }, {fontSize: "9px"}
                ), c = DOM.appendDIV(b, {id: "ago_box_header"}), DOM.appendA(c, "ago_box_icon22 galaxy highlighted", null, {task: galaxyIconFunction === 0 ? "home" : "cycle"}), DOM.appendSPAN(c, {
                        id: "ago_box_title",
                        "class": "tooltipHTML",
                        title: e
                    }, a.playerName
                ), DOM.appendA(c,
                    "ago_icon_close", null, {action: {action: "remove"}}
                ), c = DOM.appendDIV(b, {id: "ago_box_content"}), c.appendChild(d), DOM.appendChild(document.getElementById("toolLinksWrapper"), b), DOM.addEvents("ago_box", "id", {click: AGO.Box.click})
            )
        } else {
            DOM.setStyleDisplay("ago_box", "id")
        }
    }, Display: function () {
        var a, b;
        a = AGO.Panel.Get("Box", "data", 6);
        b = AGO.Panel.getActive(a, "id", 6);
        "Player" === a && b ? AGB.message("Box", "List", {tab: a, id: b, planets: 1}, AGO.Box.Show) : AGO.Box.Show()
    }, click: function (a) {
        if (a && a.target) {
            a = DOM.getData(a.target, null, 2);
            if ("cycle" === a.task) {
                let planetCount = DOM.queryAll("#ago_box_content div").length;
                if (AGO.Box.Current + 1 > planetCount) AGO.Box.Current = 0;
                DOM.click("#ago_box_content div:nth-child("+(AGO.Box.Current+1)+") a:first-child");
            }
            "home" === a.task && DOM.click("#ago_box_content .ago_box_homeplanet a:first-child");
            OBJ.is(a.action) && AGO.Box.Action(a.action);
            OBJ.is(a.message) && AGO.Init.Messages(a.message.page, a.message.role, a.message.data);
        }
    }, Action: function (a) {
        AGO.Box.enabled && OBJ.is(a) && ("remove" === a.action && (AGB.message("Box", "List", {tab: a.tab}), a.tab = ""
            ), AGO.Panel.set("Box", "data", a.tab), AGO.Box.Display()
        )
    }
};
AGO.Events = {
    status: 0, included: !1, Messages: function (a, b) {
        "highlight" === a && AGO.Events.displayHighlight(b)
    }, Run: function () {
        var a, b;
        AGO.Events.status = 1;
        AGO.Option.is("E30") && (AGO.Events.enabled = !0, AGO.Events.improve = AGO.Option.is("E31"), AGO.Events.modeAbbreviation = AGO.Option.is("E32"), AGO.Events.modeColorMissions = AGO.Option.is("CM0")
        );
        if (a = document.getElementById("eventboxContent")) {
            AGO.Events.included = Boolean(document.getElementById("eventListWrap")), AGO.Events.enabled && (b = !AGO.Events.included && 5 > AGO.Events.modeBehavior ?
                    " ago_eventlist_hide" : "", DOM.extendClass(a, null, "ago" + b), b = AGO.Events.modeBehavior ? VAL.check(AGO.Events.modeBehavior, 2, 4, 6, 8) ? 3 : AGO.Option.is("E34") ? 2 : 1 : AGO.Events.included ? 1 : 0, a.setAttribute("ago_display_status", b), AGO.Events.modeBehavior && (DOM.getChildren(a.parentNode, 0) === a ? AGO.Events.modeBehaviorAbove || a.parentNode.appendChild(a) : AGO.Events.modeBehaviorAbove && DOM.prependChild(a.parentNode, a), AGO.Styles.set("#eventboxContent:not(:first-child), #eventboxContent:first-child { display: inherit; }")
                )
            ),
            AGO.Events.included && AGO.Events.Content()
        }
    }, Ready: function () {
        AGO.Events.enabled && AGO.Events.modeBehavior && 5 > AGO.Events.modeBehavior && (DOM.setStyleDisplay("eventboxContent", "id"), AGO.Styles.set("#eventboxContent, #eventboxContent #eventListWrap { display: block; }")
        )
    }, Content: function () {
        var a, b, d, c, e, f, g, h;
        e = 1;
        AGO.Events.eData = {};
        AGO.Events.last = 0;
        a = document.getElementById("eventboxContent");
        b = document.getElementById("eventListWrap");
        if (AGO.Events.status && a && b && DOM.updateAttribute(b, null, "ago-status",
            1, 8
        )) {
            AGO.Events.status = 2;
            AGO.Events.enabled && (DOM.removeClass(a, null, "ago_eventlist_hide"), a = b.querySelector("#eventHeader")
            ) && (c = document.createDocumentFragment(), d = DOM.appendA(c, null, {
                        click: function () {
                            AGO.Global.message({role: "reloadEvents"})
                        }
                    }
                ), d = DOM.appendSPAN(d, "icon icon_reload ago_eventlist_reload"), AGO.Events.improve && (DOM.appendSPAN(c, "ago_display_arrow"), a.addEventListener("click", AGO.Events.toggleEvents, !1)
                ), DOM.prependChild(a, c)
            );
            a = b.querySelectorAll("table#eventContent > tbody > tr");
            for (d = 0; d < a.length; d++) {
                c = NMR.parseIntAbs(a[d].getAttribute("data-mission-type")), HTML.hasClass(a[d].className, "allianceAttack") ? (g = STR.check(NMR.parseIntAbs(a[d].className)), f = "F" + g, h = 1
                ) : HTML.hasClass(a[d].className, "partnerInfo") ? (g = STR.check(NMR.parseIntAbs(a[d].className)), f = DOM.getAttribute(".icon_movement span", a[d], "data-federation-user-id", 7), h = g === f ? 2 : 3
                ) : (h = g = 0, f = STR.check(NMR.parseIntAbs(a[d].id))
                ), AGO.Events.eData[f] = {
                    id: f,
                    mission: c,
                    arrival: +a[d].getAttribute("data-arrival-time") || 0,
                    union: g ||
                        "",
                    unionType: h || 0,
                    reverse: "true" === a[d].getAttribute("data-return-flight")
                }, AGO.Events.modeColorMissions && AGO.Events.eData[f].reverse && (a[d].className += " ago_events_reverse"
                ), a[d].addEventListener("click", AGO.Events.clickRow, !1), AGO.Events.parseRow(a[d], AGO.Events.eData[f]), 1 !== h && (AGO.Task.updateShips(AGO.Events.eData[f]), AGO.Task.updateResources(AGO.Events.eData[f]), 3 <= AGO.Events.eData[f].fleetType && 1 !== h && 4 !== c && (AGO.Events.eData[f].pair = AGO.Events.eData[f].reverse ? AGO.Events.eData[f - 1] ? AGO.Events.eData[f -
                        1].pair : "" : (5 === c || 15 === c
                        ) && AGO.Events.eData[f - 1] && AGO.Events.eData[f - 1].pair ? AGO.Events.eData[f - 1].pair : e++
                    ), AGO.Events.improve && (AGO.Events.eData[f].pair && (a[d].setAttribute("ago-events-pair", AGO.Events.eData[f].pair), a[d].addEventListener("mouseover", AGO.Events.displayPair, !1), a[d].addEventListener("mouseout", AGO.Events.displayPair, !1)
                        ), AGO.Events.createDetails(a[d], AGO.Events.eData[f])
                    )
                );
            }
            for (f in AGO.Events.eData) {
                AGO.Events.eData.hasOwnProperty(f) && (1 === AGO.Events.eData[f].unionType && (AGO.Task.updateShips(AGO.Events.eData[f]),
                            AGO.Task.updateResources(AGO.Events.eData[f]), AGO.Events.improve && AGO.Events.createDetails(b.querySelector("table#eventContent tr.union" + AGO.Events.eData[f].union), AGO.Events.eData[f])
                    ), 2 === AGO.Events.eData[f].fleetType && 5 === AGO.Events.eData[f].mission && AGO.Events.eData[f - 1] && (AGO.Events.eData[f].nocalc = !0
                    )
                );
            }
            a = b = a = d = a = c = null
        }
    }, parseRow: function (a, b) {
        DOM.iterateChildren(a, function (a) {
                var c;
                c = a.className;
                if (HTML.hasClass(c, "countDown")) {
                    DOM.addClass(a, null, HTML.classMission(b.mission)), a.className +=
                        " ago_panel_add", b.fleetType = HTML.hasClass(c, "neutral") ? 2 : HTML.hasClass(c, "hostile") ? 1 : b.reverse ? 4 : 3;
                } else if (HTML.hasClass(c, "arrivalTime")) {
                    c = (a.textContent || ""
                    ).split(" ")[0], a.textContent = AGO.Time.convertLocal(c, "[H]:[i]:[s]");
                } else if (HTML.hasClass(c, "missionFleet")) {
                    b.missionName = 2 <= b.unionType ? "" : b.unionType ? AGO.Label.get("LM02") : DOM.getAttribute("img", a, "title", 7).split("|")[1];
                } else if (HTML.hasClass(c, "originFleet")) {
                    if (c = a.querySelector("figure")) {
                        b.typeOrigin = HTML.hasClass(c.className, "moon") ?
                            3 : HTML.hasClass(c.className, "tf") ? 2 : 1
                    }
                } else if (HTML.hasClass(c, "coordsOrigin")) {
                    if (c = a.querySelector("a")) {
                        b.coordsOrigin = AGO.Task.trimCoords(c.textContent), b.owncoordsOrigin = AGO.Planets.owncoords(b.coordsOrigin, b.typeOrigin), b.owncoordsOrigin && (b.reverse || (5 === b.mission || 15 === b.mission
                            ) && AGO.Events.last === +b.id - 1 || (AGO.Events.last = Math.max(AGO.Events.last, +b.id || 0)
                            ), DOM.addClass(c, null, AGO.Token.getClassSelection(b.typeOrigin)), 3 <= b.owncoordsOrigin && DOM.extendClass(a, null, AGO.Token.getClassHighlight(b.typeOrigin))
                        )
                    }
                } else if (-1 <
                    c.indexOf("icon_movement")) {
                    if ((c = a.querySelector("span")
                    ) && 1 !== b.unionType) {
                        a = c.title;
                        var e;
                        if (a) {
                            for (a = a.split("<td>"), 2 <= b.unionType && AGO.Events.eData["F" + b.union] && (AGO.Events.eData["F" + b.union].fleets = (AGO.Events.eData["F" + b.union].fleets || 0
                                ) + 1
                            ), c = 1; c < a.length; c++) {
                                if (e = (a[c].split("</td>", 1)[0] || ""
                                ).replace(/\:/g, "").trim(), e = AGO.Item.getByName(e)) {
                                    b[e] = NMR.parseIntAbs(a[c].split(">", 3)[2]), b[e] && 2 <= b.unionType && AGO.Events.eData["F" + b.union] && (AGO.Events.eData["F" + b.union][e] = (AGO.Events.eData["F" +
                                            b.union][e] || 0
                                        ) + b[e]
                                    )
                                }
                            }
                        }
                    }
                } else if (HTML.hasClass(c, "destFleet")) {
                    if (c = a.querySelector("figure")) {
                        b.type = HTML.hasClass(c.className, "moon") ? 3 : HTML.hasClass(c.className, "tf") ? 2 : 1
                    }
                } else if (HTML.hasClass(c, "destCoords")) {
                    if (c = a.querySelector("a")) {
                        b.coords = AGO.Task.trimCoords(c.textContent), b.owncoords = AGO.Planets.owncoords(b.coords, b.type), b.owncoords && (DOM.addClass(c, null, AGO.Token.getClassSelection(b.type)), 3 <= b.owncoords && DOM.extendClass(a, null, AGO.Token.getClassHighlight(b.type))
                        )
                    }
                } else {
                    HTML.hasClass(c, "sendMail") &&
                    (b.nick = DOM.getAttribute(DOM.getChildnodeByName(a, "A"), null, "title", 7)
                    )
                }
            }
        )
    }, createDetails: function (a, b) {
        var d, c, e;
        1 === b.unionType && b.fleets && DOM.setText(".originFleet", a, b.fleets + " / 16");
        2 <= b.unionType && DOM.setText(".descFleet", a);
        2 === b.unionType && DOM.setText(".countDown", a, "E28", 10);
        d = document.createElement("td");
        d.className = "ago_eventlist_activity";
        3 > b.fleetType ? DOM.appendIMG(d, 1 === b.fleetType ? "/cdn/img/galaxy/activity15.gif" : "/cdn/img/galaxy/activity.gif", "14px") : d.textContent = b.pair ||
            "";
        DOM.prependChild(a, d);
        d = document.createElement("tr");
        d.className = "ago_eventlist";
        b.pair && (d.setAttribute("ago-events-pair", b.pair), d.addEventListener("mouseover", AGO.Events.displayPair, !1), d.addEventListener("mouseout", AGO.Events.displayPair, !1)
        );
        c = DOM.appendTD(d);
        c.setAttribute("colspan", 12);
        e = DOM.appendDIV(c, "ago_eventlist_left");
        b.nick && !b.owncoordsOrigin && DOM.appendSPAN(e, "ago_eventlist_player", b.nick);
        DOM.appendSPAN(e, HTML.classMission(b.mission), b.missionName);
        e = DOM.appendDIV(c, "ago_eventlist_fleet");
        (function (a, b) {
                function c(a, b, d, e) {
                    a = DOM.appendTD(a);
                    b && d && (DOM.appendSPAN(a, "ago_eventlist_label", b, e), DOM.appendTEXT(a, d, 2)
                    )
                }

                var d, e, n, l, m, q;
                n = AGO.Option.is("E32") ? 12 : 11;
                l = {ShipCivil: [], ShipCombat: [], Resource: []};
                d = a.appendChild(document.createElement("table"));
                e = DOM.appendTR(d);
                c(e, "I28", b.shipsCivil || "0", 10);
                c(e, "I29", b.shipsCombat || "0", 10);
                c(e, "I27", b.resources || "0", 10);
                for (m in l) {
                    if (l.hasOwnProperty(m)) {
                        for (q in AGO.Item[m]) {
                            AGO.Item[m].hasOwnProperty(q) && 0 < b[q] && l[m].push(q);
                        }
                    }
                }
                for (m = 0; 9 > m; m++) {
                    if (l.ShipCivil[m] ||
                        l.ShipCombat[m] || l.Resource[m]) {
                        e = DOM.appendTR(d), c(e, l.ShipCivil[m], b[l.ShipCivil[m]], n), c(e, l.ShipCombat[m], b[l.ShipCombat[m]], n), c(e, l.Resource[m], b[l.Resource[m]], n);
                    } else {
                        break;
                    }
                }
                d = e = null
            }
        )(e, b);
        e = DOM.appendDIV(c, "ago_eventlist_right");
        b.nick && !b.owncoords && DOM.appendSPAN(e, "ago_eventlist_player", b.nick);
        DOM.after(a, d);
        d = c = e = null
    }, toggleEvents: function (a) {
        !a.target || "H4" !== a.target.nodeName && "ago_display_arrow" !== a.target.className || (a = DOM.getAttribute("eventboxContent", "id", "ago_display_status",
                2
            ) + 1, DOM.setAttribute("eventboxContent", "id", "ago_display_status", 3 < a ? 1 : a, 8)
        )
    }, clickRow: function (a) {
        var b;
        a && a.target && HTML.hasClass(a.target.className, "countDown") && (b = NMR.parseIntAbs(a.target.id)
        ) && AGO.Events.eData[b] && (a = {
                action: "set",
                tab: "Target",
                marked: 1,
                token: 81,
                time: AGO.Events.eData[b].arrival,
                name: AGO.Events.eData[b].nick
            }, a.coords = AGO.Events.eData[b].reverse ? AGO.Events.eData[b].coordsOrigin + ":" + AGO.Events.eData[b].typeOrigin : AGO.Events.eData[b].coords + ":" + AGO.Events.eData[b].type, AGO.Init.Messages("Token",
                "Action", a
            )
        )
    }, displayPair: function (a) {
        var b, d;
        d = this.getAttribute("ago-events-pair");
        (b = document.getElementById("eventboxContent")
        ) && 0 < d && ("mouseover" === a.type ? DOM.iterate(b.querySelectorAll('.eventFleet[ago-events-pair="' + d + '"], .ago_eventlist[ago-events-pair="' + d + '"]'), function (a) {
                    DOM.addClass(a, null, "ago_eventlist_pair")
                }
            ) : DOM.iterate(b.querySelectorAll(".eventFleet, .ago_eventlist"), function (a) {
                    DOM.removeClass(a, null, "ago_eventlist_pair")
                }
            )
        )
    }, displayHighlight: function (a) {
        AGO.Events.highlightCurrent =
            a || 0
    }, calculate: function (a) {
        function b(a, b, c) {
            a[b] || (a[b] = {}
            );
            a[b][c] || (a[b][c] = {
                    metal: 0,
                    crystal: 0,
                    deuterium: 0,
                    resources: 0,
                    fleets: 0,
                    shipment: 0,
                    ships: 0,
                    shipsCivil: 0,
                    shipsCombat: 0,
                    reverse: 0,
                    timeResource: 1,
                    timeShip: 1
                }
            );
            return a[b][c]
        }

        function d(a, b, c, d, e) {
            function f(a, b, c, d, e) {
                c[a] = (c[a] || 0
                ) + b;
                d[a] = (d[a] || 0
                ) + b;
                e[a] = (e[a] || 0
                ) + b
            }

            var g;
            if (!e || "resources" === e) {
                for (g in AGO.Item.Resource) {
                    a[g] && (f(g, a[g], b, c, d), f("resources", a[g], b, c, d)
                    );
                }
            }
            if (!e || "ships" === e) {
                for (g in AGO.Item.Ship) {
                    a[g] && (f(g, a[g], b, c, d), f("ships",
                            a[g], b, c, d
                        ), g in AGO.Item.ShipCivil && f("shipsCivil", a[g], b, c, d), g in AGO.Item.ShipCombat && f("shipsCombat", a[g], b, c, d)
                    );
                }
                f("fleets", 1, b, c, d)
            }
        }

        var c, e, f, g, h, p, k;
        c = {};
        if (2 <= AGO.Events.status) {
            for (f in c.account = {}, AGO.Events.eData) {
                0 < +f && (e = AGO.Events.eData[f], "ownership" === a ? e.reverse ? (k = "own", h = e.coordsOrigin, g = e.coordsOrigin + ":" + e.typeOrigin, p = e.typeOrigin, d(e, b(c, "account", k), b(c, h, k), b(c, g, k), "ships"), 3 === e.mission && e.pair && (h = e.coords, g = e.coords + ":" + e.type, p = e.type
                        ), d(e, b(c, "account", k), b(c, h, k),
                            b(c, g, k), "resources"
                        )
                    ) : (h = e.coords, g = e.coords + ":" + e.type, p = e.type, (k = 2 === e.fleetType && 3 === e.mission ? "neutral" : 3 <= e.fleetType && 4 === e.mission ? "own" : ""
                        ) && d(e, b(c, "account", k), b(c, h, k), b(c, g, k))
                    ) : (e.reverse ? (h = e.coordsOrigin, g = e.coordsOrigin + ":" + e.typeOrigin, p = e.typeOrigin, k = e.pair ? "" : "back"
                        ) : (h = e.coords, g = e.coords + ":" + e.type, p = e.type, k = e.nocalc || !e.fleetType ? "" : 1 === e.fleetType ? "hostile" : 2 === e.fleetType ? "neutral" : e.owncoords ? "own" : ""
                        ), k && d(e, b(c, "account", k), b(c, h, k), b(c, g, k))
                    ), k && (c[g][k].coords = h, c[g][k].coordstype =
                            g, c[g][k].type = p
                    )
                );
            }
        }
        return c
    }
};
AGO.Chat = {
    chatBar: 0,
    Data: {
        buddies_expanded: 1,
        ally_expanded: 1,
        strangers_expanded: 1
    },
    Run: function () {
        var a;
        AGO.Option.is("O60") && (AGO.Chat.popupsDeactivated = AGO.Option.is("O61")) && AGO.Chat.removePopups();
        DOM.addObserver(DOM.query("body"), {childList: true}, function (mutations) {
            for (var i = 0; i < mutations.length; i++) {
                var mutation = mutations[i];
                if (mutation.addedNodes.length && "id" in mutation.addedNodes[0] && mutation.addedNodes[0].id === "chatBar") {
                    AGO.Chat.Content();
                }
            }
        });
    },
    Content: function () {
        AGO.Chat.chatBar = document.getElementById("chatBar");
        AGO.Chat.popupsDeactivated && AGO.Chat.removePopups();

        DOM.appendSCRIPT("window.setTimeout(function () {$('.js_playerlist').off('click','.playerlist_item');}, 1000);");
        DOM.addObserver(AGO.Chat.chatBar, {childList: true, subtree: true}, function (mutations) {
            for (var i = 0; i < mutations.length; i++) {
                var mutation = mutations[i];
                if (mutation.addedNodes.length && "id" in mutation.addedNodes[0] && mutation.addedNodes[0].id === "mCSB_3") {
                    AGO.Chat.Ready();
                }
            }
        });
    },
    Ready: function () {
        AGO.Chat.Load();
        AGO.Chat.popupsDeactivated && AGO.Chat.createLinks();

        if (!document.querySelector(".ui-dialog")) {
            if (!AGO.Chat.Data.buddies_expanded) DOM.queryAll(".ui-accordion-header")[0].click();
            if (!AGO.Chat.Data.ally_expanded) DOM.queryAll(".ui-accordion-header")[1].click();
            if (!AGO.Chat.Data.strangers_expanded) DOM.queryAll(".ui-accordion-header")[2].click();
        }
        DOM.iterate(DOM.queryAll(".ui-accordion-header"), function (obj) {
            obj.addEventListener("click", AGO.Chat.Save, false);
        });
    },
    Load: function () {
        var a;
        OBJ.hasProperties(a = AGO.Data.getStorage(AGO.App.keyPlayer + "_CHAT_DATA", "JSON")) ? AGO.Chat.Data = a : AGO.Data.setStorage(AGO.App.keyPlayer + "_CHAT_DATA", AGO.Chat.Data);
    },
    Save: function () {
        AGO.Chat.Data.buddies_expanded = ("true" === DOM.queryAll(".ui-accordion-header")[0].getAttribute("aria-expanded"));
        AGO.Chat.Data.ally_expanded = ("true" === DOM.queryAll(".ui-accordion-header")[1].getAttribute("aria-expanded"));
        AGO.Chat.Data.strangers_expanded = ("true" === DOM.queryAll(".ui-accordion-header")[2].getAttribute("aria-expanded"));
        console.log(AGO.Chat.Data);
        AGO.Data.setStorage(AGO.App.keyPlayer + "_CHAT_DATA", AGO.Chat.Data);
    },
    createLinks: function () {
        DOM.iterate(DOM.queryAll(".playerlist_item", AGO.Chat.chatBar), function (obj) {
            obj.onclick = function (e) {
                window.location.href = "index.php?page=chat&playerId=" + obj.dataset.playerid;
                return;
            };
        });
    },
    removePopups: function () {
        DOM.appendSCRIPT("window.setTimeout(function () {window.visibleChats = [];},0);");
        DOM.iterate(DOM.queryAll("#chatBar .icon_close"), function (e) {
            e.click();
        });
    }
};

var DOM = {
    query: function (a, b) {
        return "string" === typeof a ? b ? "object" === typeof b ? b.querySelector(a) : "id" === b ? document.getElementById(a) : document.getElementById(b) ? document.getElementById(b).querySelector(a) : null : document.querySelector(a) : a
    }, queryAll: function (a, b) {
        return "string" === typeof a ? (b || document
        ).querySelectorAll(a) : a && "object" === typeof a && "length" in a ? a : []
    }, findParent: function (a, b, c, d) {
        if ((a = DOM.query(a, b)
        ) && c) {
            for (d = d || 0; a && 0 <= d;) {
                if (a.id === c) {
                    return a;
                }
                d--;
                a = a.parentNode
            }
        }
        return null
    }, isDescendant: function (parent, child) {
        var node = child.parentNode;
        while (node != null) {
            if (node == parent) {
                return true;
            }
            node = node.parentNode;
        }
        return false;
    }, iterate: function (a,
                          b
    ) {
        var c;
        if (a && "object" === typeof a && "length" in a) {
            for (c = 0; c < a.length; c++) {
                a[c] && b(a[c])
            }
        }
    }, iterateChildren: function (a, b) {
        if (a) {
            for (var c = a.firstChild; c; c = c.nextSibling) {
                1 === c.nodeType && b(c)
            }
        }
    }, hasChildren: function (a) {
        return a && a.children ? a.children.length : 0
    }, getChildren: function (a, b) {
        return a && a.children ? a.children[b] : null
    }, getSelectedNode: function (a) {
        return a && a.options && "selectedIndex" in a ? a.options[a.selectedIndex] : null
    }, getChildnodeByName: function (a, b) {
        if (a && a.children) {
            for (var c = 0; c < a.children.length; c++) {
                if (a.children[c].tagName ===
                    b) {
                    return a.children[c];
                }
            }
        }
        return null
    }, prependChild: function (a, b) {
        a && b && (a.childNodes.length ? a.insertBefore(b, a.childNodes[0]) : a.appendChild(b)
        )
    }, appendChild: function (a, b) {
        a && b && a.appendChild(b)
    }, before: function (a, b) {
        a && b && a.parentNode.insertBefore(b, a)
    }, after: function (a, b) {
        a && b && (a.nextElementSibling ? a.parentNode.insertBefore(b, a.nextElementSibling) : a.parentNode.appendChild(b)
        )
    }, replaceChildren: function (a, b) {
        if (a) {
            for (; a.firstChild;) {
                a.removeChild(a.firstChild);
            }
            b && a.appendChild(b)
        }
    }, removeChildren: function (a,
                                 b
    ) {
        var c;
        if (a) {
            for (c = 0; c < a.childNodes.length; c++) {
                b && a.childNodes[c].nodeType !== b || a.removeChild(a.childNodes[c])
            }
        }
    }, create: function (a, b, c, d, e) {
        var f;
        a = document.createElement(a);
        if (b) {
            if ("string" === typeof b) {
                a.className = b;
            } else {
                for (f in b) {
                    b.hasOwnProperty(f) && a.setAttribute(f, b[f]);
                }
            }
        }
        if (c) {
            for (f in c) {
                c.hasOwnProperty(f) && (a.style[f] = c[f]
                );
            }
        }
        if (d) {
            for (f in d) {
                d.hasOwnProperty(f) && a.addEventListener(f, d[f], !1);
            }
        }
        if (e) {
            for (f in e) {
                e.hasOwnProperty(f) && (a[f] = e[f]
                );
            }
        }
        return a
    }, innerHTML: function (a, b, c) {
        if (a = DOM.query(a, b)) {
            a.innerHTML = DOMPurify.sanitize(c, {ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|chrome-extension):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i});
        }
    }, parse: function (html) {
        // based on jQuery.buildFragment()
        //
        // jQuery JavaScript Library v1.11.3
        // http://jquery.com/
        //
        // Copyright 2005, 2014 jQuery Foundation, Inc. and other contributors
        // Released under the MIT license
        // http://jquery.org/license
        var rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
            rtagName = /<([\w:]+)/,
            rhtml = /<|&#?\w+;/,
            wrapMap = {
                option: [1, "<select multiple='multiple'>", "</select>"],
                legend: [1, "<fieldset>", "</fieldset>"],
                area: [1, "<map>", "</map>"],
                param: [1, "<object>", "</object>"],
                thead: [1, "<table>", "</table>"],
                tr: [2, "<table><tbody>", "</tbody></table>"],
                col: [2, "<table><tbody></tbody><colgroup>", "</colgroup></table>"],
                td: [3, "<table><tbody><tr>", "</tr></tbody></table>"],
                _default: [0, "", ""]
            },
            nodes = [];
        wrapMap.optgroup = wrapMap.option, wrapMap.th = wrapMap.td,
            wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;

        if (!rhtml.test(html)) {
            // Convert non-html into a text node
            return document.createTextNode(html);
        } else {
            // Convert html into DOM nodes
            var tmp = document.createElement('div');

            // Deserialize a standard representation
            var tag = (rtagName.exec(html) || ["", ""])[1].toLowerCase();
            var wrap = wrapMap[tag] || wrapMap._default;

            DOM.innerHTML(tmp, null, (wrap[1] + html.replace(rxhtmlTag, "<$1></$2>") + wrap[2]));

            // Descend through wrappers to the right content
            var j = wrap[0] + 1;
            while (j--) {
                tmp = tmp.lastChild;
            }

            return tmp;
        }
    }, append: function (a, b, c, d, e, f, g) {
        var h;
        a = a ? a.appendChild(document.createElement(b)) :
            document.createElement(b);
        if (c) {
            if ("string" === typeof c) {
                a.className = c;
            } else {
                for (h in c) {
                    c.hasOwnProperty(h) && a.setAttribute(h, c[h]);
                }
            }
        }
        if (d) {
            for (h in d) {
                d.hasOwnProperty(h) && (a.style[h] = d[h]
                );
            }
        }
        if (e) {
            for (h in e) {
                e.hasOwnProperty(h) && a.addEventListener(h, e[h], !1);
            }
        }
        if (f) {
            for (h in f) {
                f.hasOwnProperty(h) && (a[h] = f[h]
                );
            }
        }
        g && a.setAttribute("ago-data", JSON.stringify(g));
        return a
    }, appendDIV: function (a, b, c) {
        var d;
        a = a ? a.appendChild(document.createElement("div")) : document.createElement("div");
        if (b) {
            if ("string" === typeof b) {
                a.className =
                    b;
            } else {
                for (d in b) {
                    b.hasOwnProperty(d) && a.setAttribute(d, b[d]);
                }
            }
        }
        if (c) {
            for (d in c) {
                c.hasOwnProperty(d) && (a.style[d] = c[d]
                );
            }
        }
        return a
    }, appendTABLE: function (a, b, c, d) {
        var e;
        a = a ? a.appendChild(document.createElement("table")) : document.createElement("table");
        a.style.tableLayout = "fixed";
        if (b) {
            if ("string" === typeof b) {
                a.className = b;
            } else {
                for (e in b) {
                    b.hasOwnProperty(e) && a.setAttribute(e, b[e]);
                }
            }
        }
        if (c) {
            for (e in c) {
                c.hasOwnProperty(e) && (a.style[e] = c[e]
                );
            }
        }
        if (d) {
            for (b = a.appendChild(document.createElement("colgroup")), e = 0; e < d.length; e++) {
                b.appendChild(document.createElement("col")).style.width =
                    d[e] + "px";
            }
        }
        return a
    }, appendTR: function (a, b, c) {
        var d;
        a = a ? a.appendChild(document.createElement("tr")) : document.createElement("tr");
        if (b) {
            if ("string" === typeof b) {
                a.className = b;
            } else {
                for (d in b) {
                    b.hasOwnProperty(d) && a.setAttribute(d, b[d]);
                }
            }
        }
        c && a.setAttribute("ago-data", "string" === typeof c ? c : JSON.stringify(c));
        return a
    }, appendTD: function (a, b, c, d, e) {
        var f;
        a = a ? a.appendChild(document.createElement("td")) : document.createElement("td");
        if (b) {
            if ("string" === typeof b) {
                a.className = b;
            } else {
                for (f in b) {
                    b.hasOwnProperty(f) &&
                    a.setAttribute(f, b[f]);
                }
            }
        }
        if (c = HTML.setText(c, d, e)) {
            a.textContent = c;
        }
        return a
    }, appendLI: function (a, b, c, d, e) {
        var f;
        a = a ? a.appendChild(document.createElement("li")) : document.createElement("li");
        if (b) {
            if ("string" === typeof b) {
                a.className = b;
            } else {
                for (f in b) {
                    b.hasOwnProperty(f) && a.setAttribute(f, b[f]);
                }
            }
        }
        if (c = HTML.setText(c, d, e)) {
            a.textContent = c;
        }
        return a
    }, appendSPAN: function (a, b, c, d, e) {
        var f;
        a = a ? a.appendChild(document.createElement("span")) : document.createElement("span");
        if (b) {
            if ("string" === typeof b) {
                a.className = b;
            } else {
                for (f in b) {
                    b.hasOwnProperty(f) &&
                    a.setAttribute(f, b[f]);
                }
            }
        }
        if (c = HTML.setText(c, d, e)) {
            a.textContent = c;
        }
        return a
    }, appendTEXT: function (a, b, c, d) {
        (b = HTML.setText(b, c, d)
        ) && a.appendChild(document.createTextNode(b))
    }, appendIMG: function (a, b, c) {
        var d;
        a = a ? a.appendChild(document.createElement("img")) : document.createElement("img");
        if (b) {
            if ("string" === typeof b) {
                a.src = b;
            } else {
                for (d in b) {
                    b.hasOwnProperty(d) && a.setAttribute(d, b[d]);
                }
            }
        }
        if (c) {
            if ("string" === typeof b) {
                a.style.width = a.style.height = c;
            } else {
                for (d in c) {
                    c.hasOwnProperty(d) && (a.style[d] = c[d]
                    );
                }
            }
        }
        return a
    },
    appendA: function (a, b, c, d, e) {
        var f;
        a = a ? a.appendChild(document.createElement("a")) : document.createElement("a");
        if (b) {
            if ("string" === typeof b) {
                a.className = b, a.href = "javascript:void(0)";
            } else {
                for (f in b.href || (b.href = "javascript:void(0)"
                ), b) {
                    b.hasOwnProperty(f) && a.setAttribute(f, b[f]);
                }
            }
        } else {
            a.href = "javascript:void(0)";
        }
        d && a.setAttribute("ago-data", "string" === typeof d ? d : JSON.stringify(d));
        if (c) {
            for (f in c) {
                c.hasOwnProperty(f) && a.addEventListener(f, c[f], !1);
            }
        }
        e && a.setAttribute("disabled", "disabled");
        return a
    }, appendSELECT: function (a,
                               b, c, d, e
    ) {
        var f;
        a = a ? a.appendChild(document.createElement("select")) : document.createElement("select");
        if (b) {
            if ("string" === typeof b) {
                a.className = b;
            } else {
                for (f in b) {
                    b.hasOwnProperty(f) && a.setAttribute(f, b[f]);
                }
            }
        }
        if (e) {
            for (f in e) {
                e.hasOwnProperty(f) && a.addEventListener(f, e[f], !1);
            }
        }
        for (f in c) {
            c.hasOwnProperty(f) && (b = a.appendChild(document.createElement("option")), b.value = f, b.textContent = AGO.Label.get(c[f]).replace(/&lt;/g, "<"), d === f && (a.selectedIndex = a.options.length - 1
                )
            );
        }
        return a
    }, appendSCRIPT: function (a, b) {
        var c;
        a && (c = document.createElement("script"), c.setAttribute("type", "text/javascript"), c.textContent = "string" === typeof a ? a : "(" + a.toString() + ")();", document.head.appendChild(c), b && document.head.removeChild(c)
        )
    }, set: function (a, b, c, d, e, f) {
        var g;
        if (a = DOM.query(a, b)) {
            if (c) {
                for (g in c) {
                    c.hasOwnProperty(g) && a.setAttribute(g, c[g]);
                }
            }
            if (d) {
                for (g in d) {
                    d.hasOwnProperty(g) && (a.style[g] = d[g]
                    );
                }
            }
            if (e) {
                for (g in e) {
                    e.hasOwnProperty(g) && a.addEventListener(g, e[g], !1);
                }
            }
            if (f) {
                for (g in f) {
                    f.hasOwnProperty(g) && (a[g] = f[g]
                    )
                }
            }
        }
    }, setAll: function (a,
                         b, c, d, e, f
    ) {
        b = DOM.queryAll(a, b);
        for (a = 0; a < b.length; a++) {
            DOM.set(b[a], null, c, d, e, f)
        }
    }, getText: function (a, b, c) {
        a = DOM.query(a, b);
        return HTML.getText(a ? a.textContent : "", c)
    }, getTextChild: function (a, b, c) {
        var d;
        if ((b = DOM.query(a, b)
        ) && b.childNodes) {
            for (a = 0; a < b.childNodes.length && (3 !== +b.childNodes[a].nodeType || !(d = (b.childNodes[a].nodeValue || ""
                    ).trim()
                )
            ); a++) {
                ;
            }
        }
        return HTML.getText(d, c)
    }, setText: function (a, b, c, d, e) {
        if (a = DOM.query(a, b)) {
            9 === d ? DOM.innerHTML(a, null, (c || "")) : a.textContent = HTML.setText(c, d, e)
        }
    }, updateText: function (a,
                             b, c, d, e
    ) {
        if (a = DOM.query(a, b)) {
            if (c = HTML.setText(c, d, e), c !== a.textContent) {
                return a.textContent = c, a;
            }
        }
        return null
    }, updateTextChild: function (a, b, c, d, e) {
        if (a = DOM.query(a, b)) {
            if (c = HTML.setText(c, d, e), 3 === +a.firstChild.nodeType) {
                if (c !== a.firstChild.textContent) {
                    return a.firstChild.textContent = c, a
                }
            } else {
                return DOM.prependChild(a, document.createTextNode(c)), a;
            }
        }
        return null
    }, getAttribute: function (a, b, c, d) {
        a = DOM.query(a, b);
        return HTML.getText(a ? a.getAttribute(c) : "", d)
    }, setAttribute: function (a, b, c, d, e) {
        (a = DOM.query(a,
                b
            )
        ) && a.setAttribute(c, HTML.setValue(d, e))
    }, removeAttribute: function (a, b, c) {
        (a = DOM.query(a, b)
        ) && a.removeAttribute(c)
    }, updateAttribute: function (a, b, c, d, e) {
        if (a = DOM.query(a, b)) {
            if (d = HTML.setValue(d, e), a.getAttribute(c) !== d) {
                return a.setAttribute(c, d), a;
            }
        }
        return null
    }, setData: function (a, b, c) {
        (a = DOM.query(a, b)
        ) && c && a.setAttribute("ago-data", "string" === typeof c ? c : JSON.stringify(c))
    }, getData: function (a, b, c) {
        return DOM.getAttributeParent(a, b, "ago-data", -2, c)
    }, getAttributeParent: function (a, b, c, d, e) {
        if (a = DOM.query(a,
            b
        )) {
            for (e = e || 0; a && 0 <= e;) {
                if (a.hasAttribute(c)) {
                    return DOM.getAttribute(a, null, c, d);
                }
                e--;
                a = a.parentNode
            }
        }
        return HTML.getText("", d)
    }, getProperty: function (a, b, c, d) {
        a = DOM.query(a, b);
        return HTML.getText(a ? a[c] : "", d)
    }, setProperty: function (a, b, c, d, e) {
        (a = DOM.query(a, b)
        ) && (a[c] = HTML.setValue(d, e)
        )
    }, updateProperty: function (a, b, c, d, e) {
        if (a = DOM.query(a, b)) {
            if (d = HTML.setValue(d, e), a[c] !== d) {
                return a[c] = d, a
            }
        }
    }, updatePropertyAll: function (a, b, c, d, e) {
        b = DOM.queryAll(a, b);
        for (a = 0; a < b.length; a++) {
            DOM.updateProperty(b[a], null,
                c, d, e
            )
        }
    }, getValue: function (a, b, c) {
        a = DOM.query(a, b);
        return HTML.getText(a ? a.value : "", c)
    }, setValue: function (a, b, c, d, e) {
        if (a = DOM.query(a, b)) {
            a.value = HTML.setValue(c, d), e && DOM.trigger(a, null, e)
        }
    }, updateValue: function (a, b, c, d, e) {
        if (a = DOM.query(a, b)) {
            if (c = HTML.setValue(c, d), c !== a.value) {
                return a.value = c, e && DOM.trigger(a, null, e), a;
            }
        }
        return null
    }, hasClass: function (a, b, c) {
        return (a = DOM.query(a, b)
        ) ? HTML.hasClass(a.className, c) : !1
    }, updateClass: function (a, b, c) {
        return (a = DOM.query(a, b)
        ) && a.className !== (c || ""
        ) ? (a.className =
                c || "", a
        ) : null
    }, addClass: function (a, b, c) {
        (b = DOM.query(a, b)
        ) && c && (a = (" " + (b.className || ""
                ).toLowerCase() + " "
            ).indexOf(" " + c.toLowerCase().trim() + " "), -1 === a && (b.className = (b.className ? b.className + " " : ""
                ) + c
            )
        )
    }, extendClass: function (a, b, c) {
        (a = DOM.query(a, b)
        ) && c && (a.className = ((a.className || ""
                ) + " " + c
            ).trim()
        )
    }, removeClass: function (a, b, c) {
        var d;
        (b = DOM.query(a, b)
        ) && c && (d = (" " + (b.className || ""
                ).toLowerCase() + " "
            ).indexOf(" " + c.toLowerCase().trim() + " "), -1 < d && (a = 0 < d ? b.className.slice(0, d).trim() : "", c = b.className.slice(d +
                    c.length
                ).trim(), b.className = a + (a && c ? " " : ""
                ) + c
            )
        )
    }, removeClassGroup: function (a, b, c) {
        (a = DOM.query(a, b)
        ) && c && (c = (a.className || ""
            ).replace(new RegExp("(^|\\s)" + c + "(\\w|_)*", "g"), " ").trim(), c !== a.className && (a.className = c
            )
        )
    }, setClassGroup: function (a, b, c, d) {
        (a = DOM.query(a, b)
        ) && c && (c = (a.className || ""
            ).replace(new RegExp("(^|\\s)" + c + "(\\w|_)*", "g"), " ").trim() + (d ? " " + d : ""
            ), c !== a.className && (a.className = c
            )
        )
    }, setStyleColor: function (a, b, c) {
        if (a = DOM.query(a, b)) {
            a.style.color = c || ""
        }
    }, setStyleDisplay: function (a,
                                  b, c
    ) {
        if (a = DOM.query(a, b)) {
            a.style.display = c || "none"
        }
    }, updateStyle: function (a, b, c, d) {
        return (a = DOM.query(a, b)
        ) && a.style[c] !== (d || ""
        ) ? (a.style[c] = d || "", a
        ) : null
    }, addObserver: function (a, b, c) {
        var d;
        a && c && (d = new window.MutationObserver(c)
        ) && d.observe(a, b || {childList: !0});
        return d
    }, removeObserver: function (a) {
        try {
            a && a.disconnect && a.disconnect()
        } catch (b) {
        }
    }, click: function (a, b) {
        DOM.trigger(a, b, "click")
    }, trigger: function (a, b, c) {
        (b = DOM.query(a, b)
        ) && c && ("click" === c || "mouseup" === c || "mousedown" === c || "mouseover" ===
            c || "mouseout" === c ? (a = document.createEvent("MouseEvents"), a.initMouseEvent(c, !0, !0, window, 0, 0, 0, 0, 0, !1, !1, !1, !1, 0, null), b.dispatchEvent(a)
            ) : "change" === c || "focus" === c || "blur" === c ? (a = document.createEvent("HTMLEvents"), a.initEvent(c, !0, !1), b.dispatchEvent(a)
            ) : "keyup" === c && (a = document.createEvent("KeyboardEvent"), "initKeyboardEvent" in a ? a.initKeyboardEvent("keyup", !0, !0, window, !1, !1, !1, !1, 0, 0) : a.initKeyEvent("keyup", !0, !0, window, !1, !1, !1, !1, 0, 0), b.dispatchEvent(a)
            )
        )
    }, addEvents: function (a, b, c) {
        var d;
        if (a =
            DOM.query(a, b)) {
            for (d in c) {
                c.hasOwnProperty(d) && a.addEventListener(d, c[d], !1)
            }
        }
    }, addEventsAll: function (a, b, c) {
        var d;
        b = DOM.queryAll(a, b);
        for (a = 0; a < b.length; a++) {
            for (d in c) {
                c.hasOwnProperty(d) && b[a].addEventListener(d, c[d], !1)
            }
        }
    }, setFocus: function (a, b) {
        var c = DOM.query(a, b);
        c && c.focus()
    }, disableAutocomplete: function () {
        AGO.Option.is("U41") && window.setTimeout(function () {
                DOM.setAll("form", null, {autocomplete: "off"})
            }, 0
        )
    }, disableActiveElement: function (a) {
        if (AGO.Init.mobile && document.activeElement) {
            if ("TEXTAREA" ===
                document.activeElement.tagName || "INPUT" === document.activeElement.tagName && "text" === document.activeElement.type) {
                if (VAL.check(AGO.App.page, "fleet1", "fleet2")) {
                    DOM.setFocus("continue", "id");
                } else if ("fleet3" === AGO.App.page) {
                    DOM.setFocus("start", "id");
                } else {
                    try {
                        document.activeElement.blur()
                    } catch (b) {
                    }
                }
            } else {
                a || window.setTimeout(DOM.disableActiveElement, 30, !0)
            }
        }
    }, changeInput: function (a, b) {
        var c, d;
        return a && b && (!AGO.isFirefox || AGO.Option.is("U41")
        ) ? (c = a.shiftKey && a.ctrlKey ? 1E3 : a.ctrlKey ? 100 : a.shiftKey ? 10 : 1, d = DOM.getValue(b,
                null, 2
            ), d = 38 === a.keyCode ? d + c : d - c, DOM.setValue(b, null, Math.max(d, 0)), DOM.trigger(b, null, "keyup"), !1
        ) : !0
    }
}, HTML = {
    getText: function (a, b) {
        if (1 === b) {
            return Boolean(a);
        }
        if (2 === b) {
            return NMR.parseIntFormat(a);
        }
        if (3 === b) {
            return NMR.parseIntAbs(a);
        }
        if (7 === b) {
            return (a || ""
            ).trim();
        }
        if (-2 === b) {
            try {
                return JSON.parse(a || "{}")
            } catch (c) {
                return {}
            }
        } else {
            return a || ""
        }
    }, setText: function (a, b, c) {
        b && (a = 2 === b ? STR.formatNumber(a) : 4 === b ? STR.formatNumber(a, !0) : 5 === b ? STR.shortNumber(a) : 3 === b ? a ? STR.formatNumber(a) : "0" : 7 === b ? STR.trim(a) :
                8 === b ? STR.zero(a) : 10 === b ? AGO.Label.get(a) : 11 === b ? AGO.Label.get(a, 1) : 12 === b ? AGO.Label.get(a, 2) : 15 === b ? AGO.Time.format(a, c) : 16 === b ? AGO.Time.format(a, c, !0) : 17 === b ? AGO.Time.formatTimestamp(a, c) : 18 === b ? AGO.Time.formatTime(a) : 19 === b ? AGO.Time.formatTime(a, !0) : a
        );
        return a ? a + "" : ""
    }, setValue: function (a, b) {
        b && (a = 1 === b ? Boolean(a) : 7 === b ? STR.trim(a) : 8 === b ? STR.zero(a) : -2 === b ? JSON.stringify(a || {}) : a
        );
        return a ? a + "" : ""
    }, urlImage: function (a) {
        return AGO.App.pathSkin + "ago/images/" + a
    }, urlMissionIcon: function (a) {
        return AGO.App.pathSkin +
            "ago/images/task/mission-" + (a || 0
            ) + ".gif"
    }, urlTypeIcon: function (a, b) {
        return AGO.App.pathSkin + "ago/images/task/type-" + (a || 0
        ) + (b || "a"
        ) + ".gif"
    }, hasClass: function (a, b) {
        a = a.replace(/\s+/g, " ");
        return b ? -1 < (" " + (a || ""
            ).toLowerCase() + " "
        ).indexOf(" " + b.toLowerCase().trim() + " ") : !1
    }, classMission: function (a) {
        return "ago_color_M" + STR.trimZero(a, 2)
    }, classType: function (a) {
        return AGO.Styles.classType[a] || ""
    }, classStatus: function (a) {
        return 0 < a ? "ago_color_lightgreen" : 0 > a ? "ago_color_palered" : "ago_color_orange"
    }, classStatusData: function (a) {
        return AGO.Styles.classStatusData[(a ||
            0
        ) + 2] || ""
    },
    colorStatusData: function (errcode) {
        return AGO.Styles.colorStatusData[(errcode || 0) + 2] || "";
    }, color: function (a, b) {
        return !a || 4 !== a.length && 7 !== a.length ? "" : 0 < b && 100 > b ? (a = 7 === a.length ? parseInt(a.substring(1, 3), 16) + "," + parseInt(a.substring(3, 5), 16) + "," + parseInt(a.substring(5, 7), 16) : parseInt(a.substring(1, 2), 16) + "," + parseInt(a.substring(2, 3), 16) + "," + parseInt(a.substring(3, 4), 16), "rgba(" + a + (10 > b ? ",0.0" : ",0."
            ) + b + ")"
        ) : a
    }, getPlayer: function (a, b, c) {
        return (c ? '<span class="honorRank ' + AGO.Ogame.getHonorClass(c) + '">&nbsp;</span>' :
                ""
        ) + '<span class="' + AGO.Token.getClass(b) + '">' + (a || ""
        ) + "</span>"
    }
}, OBJ = {
    parse: function (a) {
        if (a && "object" === typeof a) {
            return a;
        }
        try {
            return JSON.parse(a || "{}")
        } catch (b) {
            return {}
        }
    }, split: function (a, b) {
        var c = {}, d, e, f;
        d = STR.check(a).split(b || ";");
        for (f = 0; f < d.length; f++) {
            e = (d[f] || ""
            ).split("="), e[0] && (c[e[0]] = e[1] || ""
            );
        }
        return c
    }, create: function (a) {
        var b = {}, c;
        if (a && "object" === typeof a) {
            for (c in a) {
                "object" !== typeof a[c] && (b[c] = a[c]
                );
            }
        }
        return b
    }, createKey: function (a, b) {
        var c = {};
        a && (c[a] = b
        );
        return c
    },
    // copy properties of object obj into target
    copy: function (obj, target) {
        if (obj && "object" === typeof obj && target && "object" === typeof target) {
            for (let key in obj) {
                "object" !== typeof obj[key] && (target[key] = obj[key])
            }
        }
    }, is: function (a) {
        return a && "object" === typeof a
    }, hasProperties: function (a) {
        return a && "object" === typeof a && Object.keys(a).length
    }, get: function (a, b) {
        return a && "object" === typeof a && b in a ? a[b] : ""
    }, set: function (a, b, c) {
        a && "object" === typeof a && (a[b] = c
        )
    }, iterate: function (a, b) {
        if (a && "object" === typeof a) {
            for (var c in a) {
                a.hasOwnProperty(c) && b(c)
            }
        }
    }, iterateFilter: function (a, b, c) {
        if (a && "object" === typeof a) {
            for (var d in a) {
                a.hasOwnProperty(d) &&
                -1 !== c.indexOf(d) && b(d)
            }
        }
    }, iterateArray: function (a, b) {
        Array.isArray(a) && a.forEach(b)
    }, deleteWhere: function (obj, key, value) {
        if (obj && "object" === typeof obj) {
            for (var i in obj) {
                obj.hasOwnProperty(i) && obj[i][key] === value && delete obj[i]
            }
        }
    }, isEmpty: function (object) {
        for (var key in object) {
            if (object.hasOwnProperty(key)) {
                return false;
            }
        }
        return true;
    }
}, VAL = {
    // choose nth argument
    // example choose(a, planetName, "", moonName) where a = type (1 = planet, 3 = moon)
    choose: function (n) {
        return 0 < n ? arguments[n] : "";
    },
    select: function (a) {
        for (var b = 1; b < arguments.length; b++) {
            if (a === arguments[b]) {
                return arguments[b]
            }
        }
    }, check: function (a) {
        for (var b = 1; b < arguments.length; b++) {
            if (a === arguments[b]) {
                return !0;
            }
        }
        return !1
    }, status: function (a, b, c, d) {
        return 0 > a ? b : 0 < a ? d : c
    }
}, NMR = {
    minMax: function (a, b, c) {
        return Math.max(Math.min(+a || 0, c), b)
    }, isMinMax: function (a, b, c) {
        return +a >= b && +a <= c
    }, isGreater: function (a,
                            b
    ) {
        return 0 < +b && +a >= +b
    }, isLesser: function (a, b) {
        return 0 < +a && +b >= +a
    }, parseInt: function (a) {
        return "string" === typeof a ? parseInt(a, 10) : "number" === typeof a ? Math.floor(a) : 0
    }, parseIntFormat: function (a) {
        return "string" === typeof a ? +a.replace(/[^\d\-]/g, "") || 0 : "number" === typeof a ? Math.floor(a) : 0
    }, parseIntAbs: function (a) {
        return "string" === typeof a ? +a.replace(/[^\d]/g, "") || 0 : "number" === typeof a ? Math.floor(Math.abs(a)) : 0
    }, parseVersion: function (a) {
        return (a = /(\d+)\D*(\d*)\D*(\d*)\D*(\d*)/.exec(a ? a.toString() : "")
        ) ?
            parseInt(("00" + a[1]
            ).slice(-2) + ("00" + a[2]
            ).slice(-2) + ("00" + a[3]
            ).slice(-2) + ("00" + a[4]
            ).slice(-2), 10
            ) : 0
    }, parseIntShortcut: function (a) {
        a = STR.check(a).toLowerCase();
        return (-1 < a.indexOf("k") ? 1E3 : 1
        ) * parseInt(a.replace(/[^\d]/g, ""), 10)
    }, parseIntRess: function (a) {
        var r;
        a = STR.trim((a.match(/: ([^<]+)*/) ? a.match(/: ([^<]+)*/)[1] : a));
        if (a.match(/^[0-9]{1,3}\.[0-9]{3}$/))
            a = a.replace('.', '');
        else if ((r = new RegExp('^([0-9]{1,3}(\.|,))?[0-9]{1,3}(' + AGO.Label.is("KU0B") + ')')) && a.match(r))
            a = a.replace(/,/g, '.').replace(AGO.Label.is("KU0B"), '') * 1000000000;
        else if ((r = new RegExp('^([0-9]{1,3}(\.|,))?[0-9]{1,3}(' + AGO.Label.is("KU0M") + ')')) && a.match(r))
            a = a.replace(/,/g, '.').replace(AGO.Label.is("KU0M"), '') * 1000000;
        return parseInt(a, 10);
    }
}, STR = {
    check: function (a) {
        return "string" === typeof a ? a : "number" === typeof a && a ? a + "" : ""
    }, trim: function (a) {
        return "string" === typeof a ? a.trim() : "number" === typeof a && a ? a + "" : ""
    }, zero: function (a) {
        return a ? "string" === typeof a ? a : "number" === typeof a ? a + "" : "0" : "0"
    }, trimZero: function (a,
                           b
    ) {
        a = "0000" + a;
        return a.substr(a.length - b)
    }, formatNumber: function (a, b) {
        var c = "";
        if (a) {
            b && (1E9 <= Math.abs(a) ? (a = Math.floor(a / 1E6), c = "\u2009" + AGO.Label.is("KU0M")
                ) : 1E6 <= Math.abs(a) && (a = Math.floor(a / 1E3), c = "\u2009" + AGO.Label.is("KU0K")
                )
            );
            for (var d = [], e = Math.abs(+a || 0) + ""; ;) {
                var f = e.slice(-3);
                if (f) {
                    d.unshift(f), e = e.substr(0, e.length - f.length);
                } else {
                    break
                }
            }
            return (0 > a ? "-" : ""
            ) + d.join(AGO.Label.is("KU0S")) + c
        }
        return 0
    }, shortNumber: function (a, b) {
        var c, d;
        c = 2 === b ? 1 : 1 === b ? 10 : 100;
        if (1E9 <= a) {
            c = Math.ceil(a / 1E7 / c) + "", d =
                AGO.Label.is("KU0B");
        } else if (1E6 <= a) {
            c = Math.ceil(a / 1E4 / c) + "", d = AGO.Label.is("KU0M");
        } else if (1E3 <= a) {
            c = Math.ceil(a / 10 / c) + "", d = AGO.Label.is("KU0K");
        } else {
            return a ? a : "0";
        }
        return b ? c.substr(0, c.length - b) + AGO.Label.is("KU0S") + c.substr(c.length - b) + "\u2009" + d : c + "\u2009" + d
    }, getParameter: function (a, b) {
        var c = decodeURIComponent(b || "").replace(/\?/g, "&").split("&" + a + "=")[1];
        return c ? c.split("&")[0].split("#")[0] || "" : ""
    }, addParameter: function (a, b) {
        b = STR.trim(b);
        return a && b ? "&" + a + "=" + encodeURI(b) :
            ""
    }, splitParameter: function (a) {
        var b, c, d;
        if (a = decodeURIComponent(a || "").replace(/\?/g, "&").split("#")[0]) {
            for (b = {}, a = a.split("&"), d = 0; d < a.length; d++) {
                c = (a[d] || ""
                ).split("="), c[0] && (b[c[0]] = c[1] || ""
                );
            }
        }
        return b
    }, getMatches: function (string, regex, index) {
        index || (index = 1); // default to the first capturing group
        var matches = [];
        var match;
        while (match = regex.exec(string))
            matches.push(match[index]);
        return matches;
    }
};

Node.prototype.hasClass = function (selector) {
    if (this.classList.contains(selector)) return true;
    else return false;
};

AGO.Notify = {
    status: 0,
    Problem: [],
    problem: 0,
    Run: function () {
        AGO.App.reload || (AGO.App.upgradeAvailable && AGO.Notify.set("Problem", 4), AGO.Events.included || AGO.Notify.set("Problem", 6), 1 !== AGO.Uni.status && AGO.Notify.set("Problem", 11), 1 !== AGO.Units.Data.status && AGO.Notify.set("Problem", 12), 1 !== AGO.Label.Data.status && AGO.Notify.set("Problem", 13), 1 !== AGO.App.storage && AGO.Notify.set("Problem", 15), 1 !== AGO.Option.Data.status && AGO.Notify.set("Problem", 17), AGO.App.twice && AGO.Notify.set("Problem", 18)
        )
    },
    set: function (type, errcode, text) {
        let label, color;
        if ("Problem" === type) {
            AGO.Notify.problem = 0;

            // S44/45/46/48 = option to hide that specific notification
            if (4 === errcode && AGO.Option.is("S44") ||    // 4 = new update?
                5 === errcode && AGO.Option.is("S45") ||    // 5 = no full spy reports (deprecated)
                6 === errcode && (AGO.Option.is("S46") || !AGO.Option.is("E30")) || // 6 = events not available
                8 === errcode && AGO.Option.is("S48")) {    // 8 = problem with browser database
                errcode = 0;    // set errcode to 0 if the respective option to hide notification is checked
            }

            //#TODO: Find out what negative error codes mean
            if (0 < errcode)
                AGO.Notify.Problem[errcode] = errcode;
            else if (0 > errcode)
                AGO.Notify.Problem[Math.abs(errcode)] = 0;

            for (errcode = 0; errcode < AGO.Notify.Problem.length; errcode++) {
                if (AGO.Notify.Problem[errcode] > AGO.Notify.problem)
                    AGO.Notify.problem = errcode;
            }

            errcode = 0;
        }

        if (5 < AGO.Init.status) {
            if ("Hide" === type) {
                AGO.Notify.loading = false;
            }

            // error code = 3 is when data is being loaded into the database, e.g. when loading universe or player data
            if (3 === errcode) {
                AGO.Notify.loading = true;
            }

            color = HTML.colorStatusData(errcode);

            if (3 !== errcode) {
                if (20 <= AGO.Notify.problem)
                    AGO.Notify.color = "#FF0000";
                else if (10 < AGO.Notify.problem)
                    AGO.Notify.color = "#FF4B00";
                else if (AGO.Notify.loading)
                    AGO.Notify.color = "#FF4B00";
                else if (5 <= AGO.Notify.problem)
                    AGO.Notify.color = "#FF9600";
                else if (4 <= AGO.Notify.problem)
                    AGO.Notify.color = "#FFB500";
                else if (AGO.Notify.problem)
                    AGO.Notify.color = "#00B000";
                else
                    AGO.Notify.color = "";

                AGO.Main.updateButton();
            }

            // "Notify" shows a notification beneath the AGO button
            if ("Notify" === type) {
                // if AGO.Notify.problem is between 1 and 19, the corresponding label is problem+60
                // if not there is no label to notify and thus no notification is shown
                if (NMR.isMinMax(AGO.Notify.problem, 1, 19)) {
                    label = AGO.Label.is("S" + (AGO.Notify.problem + 60));
                }
                color = AGO.Notify.color;
            } else {
                label = AGO.Label.is(type);
            }

            // if AGO is on "Interactive" status and there is a label, show notification
            if (5 < AGO.Init.status && label) {
                AGO.Main.updateInfo(type, label + (text || ""), color);
            }
        }
    }
};
AGO.Option = {
    Data: {}, Start: function () {
        3 <= AGO.App.mode && (AGO.Option.Data = AGO.Data.getStorage(AGO.App.keyPlayer + "_Option", "JSON")
        )
    }, Init: function (a) {
        AGO.Option.Data = OBJ.is(a) ? a : {};
        AGO.Init.mobile = AGO.Option.is("U51") && (AGO.isMobile || 1 < AGO.Option.get("U51", 2)
        );
        AGO.Init.touch = AGO.Option.is("U52") && (AGO.isMobile || AGO.Init.mobile || 1 < AGO.Option.get("U52", 2)
        );
        AGO.App.reload && AGO.Option.Save()
    }, Save: function () {
        AGO.Data.setStorage(AGO.App.keyPlayer + "_Option", {
                O04: AGO.Option.is("O04"), U31: AGO.Option.is("U31"),
                U32: AGO.Option.isAnd("U31", "U32")
            }
        )
    }, set: function (a, b, c) {
        a && (b = 6 <= c ? STR.check(b) : 1 === c ? b ? 1 : 0 : +b || 0, AGO.Option.Data[a] = b, AGB.message("Option", "Set", {
                    id: a,
                    value: b
                }, function (a) {
                    a && (AGO.Option.Data[a.id] = a.value
                    )
                }
            )
        )
    }, get: function (a, b) {
        return b ? 2 === b ? +AGO.Option.Data[a] || 0 : 1 === b ? Boolean(AGO.Option.Data[a]) : a in AGO.Option.Data ? "string" === typeof AGO.Option.Data[a] ? AGO.Option.Data[a] : STR.check(AGO.Option.Data[a]) : "" : a in AGO.Option.Data ? AGO.Option.Data[a] : ""
    }, is: function (a) {
        return Boolean(AGO.Option.Data[a])
    },
    isAnd: function (a, b) {
        return Boolean(AGO.Option.Data[a] && AGO.Option.Data[b])
    }, getPair: function (a) {
        a = STR.check(AGO.Option.Data[a]).split("|", 2);
        return 2 === a.length ? a : ""
    },
    Menu: function () {
        if (!document.getElementById("ago_menu")) {
            AGB.message("App", "Script", {scripts: ["menu"]});
        }
    }
};
AGO.Label = {
    Data: {}, Init: function (a) {
        AGO.Label.Data = OBJ.is(a) ? a : {}
    }, Update: function () {
        var a;
        AGO.App.OgameMain && (a = {
                localization: AGO.Global.message({
                        role: "getProperty",
                        property: "LocalizationStrings"
                    }
                ), production: OBJ.parse(AGO.Init.Script("production"))
            }, AGB.message("Label", "Update", {data: a})
        )
    }, get: function (a, b) {
        return a ? (b && (a = (2 === b ? "K" : "L"
                ) + (AGO.Item.ResourceEnergy[a] ? AGO.Item.ResourceEnergy[a] : 1 === a.length ? "00" + a : 2 === a.length ? "0" + a : a
                )
            ), a in AGO.Label.Data ? (AGO.Label.Data[a] || ""
            ).replace(/&amp;/g,
                "&"
            ) : a
        ) : ""
    }, is: function (a) {
        return a in AGO.Label.Data ? (AGO.Label.Data[a] || ""
        ).replace(/&amp;/g, "&") : ""
    }
};
AGO.Styles = {
    status: 0,
    Data: null,
    opacity: 33,
    colorStatusData: [
        "#FF0000",
        "#FF0000",
        "",
        "#008000",
        "#FFB500",
        "#FF4B00",
        "#00B000"],
    classStatusData: "ago_color_red ago_color_red  ago_color_green ago_color_lightorange ago_color_darkorange ago_color_lightgreen".split(" "),
    classType: ["", "ago_color_planet", "ago_color_debris", "ago_color_moon"],
    classVisible: "ago_visible_hide ago_visible_hide ago_visible_weakest ago_visible_weaker ago_visible_weak ago_visible_middle ago_visible_strong ago_visible_stronger ago_visible_strongest ago_visible_show".split(" "),
    classFleet: " ago_color_hostile ago_color_neutral ago_color_own ago_color_reverse ago_color_friend ago_color_enemy".split(" "),
    Start: function () {
        function a(a) {
            return a ? '@import url("' + AGO.App.pathSkin + "ago/" + a + '.css' + (AGO.App.beta ? '?' + (new Date()).getTime() : '') + '");' : ""
        }

        var b, c, d = [];
        3 <= AGO.App.mode && AGO.App.keyPlayer && (document.documentElement.style.overflowY = "scroll", c = AGO.Data.getStorage(AGO.App.keyPlayer + "_Styles", "JSON"), "Color" in c && (AGO.Styles.status = 1, AGO.Styles.Data = c, OBJ.is(c.colorType) && (AGO.Styles.colorType = c.colorType
                ), OBJ.is(c.Page) || (c.Page = {}
                ), b = AGO.App.page, OBJ.is(c[b]) && ("file" in c[b] && (c.Page.file = c[b].file
                    ), "improve" in c[b] && (c.Page.improve = c[b].improve
                    ),
                    "events" in c[b] && (c.Page.events = c[b].events
                    )
                ), c.Events && (AGO.Events.modeBehavior = +c.Page.events || 0, AGO.Events.modeBehaviorAbove = VAL.check(AGO.Events.modeBehavior, 1, 2, 5, 6), AGO.Events.modeBehavior && (AGO.Events.modeBehaviorAbove ? d.push("#eventboxContent:not(:first-child){display:none;}") : d.push("#eventboxContent:first-child{display:none;}"), 5 > AGO.Events.modeBehavior && d.push("#eventboxContent, #eventboxContent #eventListWrap{ display: none; }")
                    )
                ), c.Styles = d.join(""), b = document.createDocumentFragment(),
                    DOM.append(b, "style", {
                            type: "text/css",
                            media: "screen"
                        }
                    ).textContent = a(c.Main) + a(c.Planets) + a(c.Events) + a(c.Page.file) + a(c.Mobile) + (c.Skin || ""
                    ) + (c.Color || ""
                    ), AGO.isFirefox && document.head && 3 > AGO.App.beta ? DOM.appendChild(document.head, b) : DOM.prependChild(document.documentElement, b), window.setTimeout(AGO.Styles.preload, 5)
            )
        )
    },
    Init: function () {
        var a;
        a = document.createDocumentFragment();
        AGO.Styles.Sheet = DOM.append(a, "style", {type: "text/css", media: "screen"});
        (AGO.App.Ogame || window.location.href.indexOf("component=empire") > -1) && OBJ.is(AGO.Styles.Data) && (OBJ.get(AGO.Styles.Data.Page,
                "improve"
            ) && ("overview" === AGO.App.page && 1 !== AGO.Acc.type || DOM.extendClass(document.body, null, "ago_improve")
            ), AGO.Styles.set(AGO.Styles.Data.Styles)
        );
        document.head.appendChild(a)
    },
    Load: function (a) {
        AGO.App.Ogame && (1 !== AGO.Styles.status || AGO.App.reload || a
        ) && (AGB.Log("Update   - Styles   :", !0), AGB.message("Styles", "Init", {mobile: AGO.App.OgameMobile}, function (a) {
                    AGO.Data.setStorage(AGO.App.keyPlayer + "_Styles", a);
                    1 !== AGO.Styles.status && (AGO.Styles.Start(), AGO.Styles.Init()
                    )
                }
            )
        )
    },
    set: function (a) {
        STR.check(a) &&
        AGO.Styles.Sheet && AGO.Styles.Sheet.appendChild(document.createTextNode(a))
    },
    preload: function () {
        var a, b;
        a = ["menu_logo.png"];
        for (b = 0; b < a.length; b++) {
            (new window.Image
            ).src = HTML.urlImage(a[b]);
        }
        if (VAL.check(AGO.App.page, "fleet1", "fleet2")) {
            a = ["0", 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 13, 15];
            for (b = 0; b < a.length; b++) {
                (new window.Image
                ).src = HTML.urlImage("task/mission-" + a[b] + ".gif");
            }
            a = "0a 0b 1a 1b 1c 2a 2b 3a 3b 3c".split(" ");
            for (b = 0; b < a.length; b++) {
                (new window.Image
                ).src = HTML.urlImage("task/type-" + a[b] + ".gif")
            }
        } else {
            "fleet3" ===
            AGO.App.page && ((new window.Image
                ).src = HTML.urlImage("fleet3_send_green.gif"), (new window.Image
                ).src = HTML.urlImage("fleet3_send_orange.gif")
            ), (new window.Image
            ).src = HTML.urlImage("task/type-3a.gif")
        }
    }
};
AGO.Item = {
    1: {metal: 60, crystal: 15, deuterium: 0, factor: 1.5},
    2: {metal: 48, crystal: 24, deuterium: 0, factor: 1.6},
    3: {metal: 225, crystal: 75, deuterium: 0, factor: 1.5},
    4: {metal: 75, crystal: 30, deuterium: 0, factor: 1.5},
    12: {metal: 900, crystal: 360, deuterium: 180, factor: 1.8},
    14: {metal: 400, crystal: 120, deuterium: 200, factor: 2},
    15: {metal: 1E6, crystal: 5E5, deuterium: 1E5, factor: 2},
    21: {metal: 400, crystal: 200, deuterium: 100, factor: 2},
    22: {metal: 1E3, crystal: 0, deuterium: 0, factor: 2},
    23: {metal: 1E3, crystal: 500, deuterium: 0, factor: 2},
    24: {
        metal: 1E3,
        crystal: 1E3, deuterium: 0, factor: 2
    },
    25: {metal: 2645, crystal: 0, deuterium: 0, factor: 2.3},
    26: {metal: 2645, crystal: 1322, deuterium: 0, factor: 2.3},
    27: {metal: 2645, crystal: 2645, deuterium: 0, factor: 2.3},
    31: {metal: 200, crystal: 400, deuterium: 200, factor: 2},
    33: {metal: 0, crystal: 5E4, deuterium: 1E5, factor: 2},
    34: {metal: 2E4, crystal: 4E4, deuterium: 0, factor: 2},
    36: {metal: 200, crystal: 0, deuterium: 50, factor: 5},
    41: {metal: 2E4, crystal: 4E4, deuterium: 2E4, factor: 2},
    42: {metal: 2E4, crystal: 4E4, deuterium: 2E4, factor: 2},
    43: {metal: 2E6, crystal: 4E6, deuterium: 2E6, factor: 2},
    44: {
        metal: 2E4, crystal: 2E4,
        deuterium: 1E3, factor: 2
    },
    106: {metal: 200, crystal: 1E3, deuterium: 200, factor: 2},
    108: {metal: 0, crystal: 400, deuterium: 600, factor: 2},
    109: {metal: 800, crystal: 200, deuterium: 0, factor: 2},
    110: {metal: 200, crystal: 600, deuterium: 0, factor: 2},
    111: {metal: 1E3, crystal: 0, deuterium: 0, factor: 2},
    113: {metal: 0, crystal: 800, deuterium: 400, factor: 2},
    114: {metal: 0, crystal: 4E3, deuterium: 2E3, factor: 2},
    115: {metal: 400, crystal: 0, deuterium: 600, factor: 2},
    117: {metal: 2E3, crystal: 4E3, deuterium: 600, factor: 2},
    118: {
        metal: 1E4, crystal: 2E4, deuterium: 6E3,
        factor: 2
    },
    120: {metal: 200, crystal: 100, deuterium: 0, factor: 2},
    121: {metal: 1E3, crystal: 300, deuterium: 100, factor: 2},
    122: {metal: 2E3, crystal: 4E3, deuterium: 1E3, factor: 2},
    123: {metal: 24E4, crystal: 4E5, deuterium: 16E4, factor: 2},
    124: {metal: 4E3, crystal: 8E3, deuterium: 4E3, factor: 1.75},
    199: {metal: 0, crystal: 0, deuterium: 0, factor: 3},
    202: {
        metal: 2E3,
        crystal: 2E3,
        deuterium: 0,
        retreat: 1E3,
        drive: "115",
        speed: 5E3,
        capacity: 5E3,
        consumption: 10
    },
    203: {
        metal: 6E3, crystal: 6E3, deuterium: 0, retreat: 3E3, drive: "115", speed: 7500, capacity: 25E3,
        consumption: 50
    },
    204: {
        metal: 3E3,
        crystal: 1E3,
        deuterium: 0,
        retreat: 4E3,
        drive: "115",
        speed: 12500,
        capacity: 50,
        consumption: 20
    },
    205: {
        metal: 6E3,
        crystal: 4E3,
        deuterium: 0,
        retreat: 1E4,
        drive: "117",
        speed: 1E4,
        capacity: 100,
        consumption: 75
    },
    206: {
        metal: 2E4,
        crystal: 7E3,
        deuterium: 2E3,
        retreat: 29E3,
        drive: "117",
        speed: 15E3,
        capacity: 800,
        consumption: 300
    },
    207: {
        metal: 45E3,
        crystal: 15E3,
        deuterium: 0,
        retreat: 6E4,
        drive: "118",
        speed: 1E4,
        capacity: 1500,
        consumption: 500
    },
    208: {
        metal: 1E4, crystal: 2E4, deuterium: 1E4, retreat: 1E4, drive: "117", speed: 2500,
        capacity: 7500, consumption: 1E3
    },
    209: {
        metal: 1E4,
        crystal: 6E3,
        deuterium: 2E3,
        retreat: 4500,
        drive: "115",
        speed: 2E3,
        capacity: 2E4,
        consumption: 300
    },
    210: {metal: 0, crystal: 1E3, deuterium: 0, retreat: 0, drive: "115", speed: 1E8, capacity: 0, consumption: 1},
    211: {
        metal: 5E4,
        crystal: 25E3,
        deuterium: 15E3,
        retreat: 9E4,
        drive: "117",
        speed: 4E3,
        capacity: 500,
        consumption: 1E3
    },
    212: {metal: 0, crystal: 2E3, deuterium: 500, retreat: 0, drive: 0, speed: 0, capacity: 0, consumption: 0},
    213: {
        metal: 6E4, crystal: 5E4, deuterium: 15E3, retreat: 125E3, drive: "118", speed: 5E3,
        capacity: 2E3, consumption: 1E3
    },
    214: {
        metal: 5E6,
        crystal: 4E6,
        deuterium: 1E6,
        retreat: 1E7,
        drive: "118",
        speed: 100,
        capacity: 1E6,
        consumption: 1
    },
    215: {
        metal: 3E4,
        crystal: 4E4,
        deuterium: 15E3,
        retreat: 85E3,
        drive: "118",
        speed: 1E4,
        capacity: 750,
        consumption: 250
    },
    401: {metal: 2E3, crystal: 0, deuterium: 0, retreat: 2E3},
    402: {metal: 1500, crystal: 500, deuterium: 0, retreat: 2E3},
    403: {metal: 6E3, crystal: 2E3, deuterium: 0, retreat: 8E3},
    404: {metal: 2E4, crystal: 15E3, deuterium: 2E3, retreat: 37E3},
    405: {metal: 2E3, crystal: 6E3, deuterium: 0, retreat: 8E3},
    406: {metal: 5E4, crystal: 5E4, deuterium: 3E4, retreat: 13E4},
    407: {metal: 1E4, crystal: 1E4, deuterium: 0, retreat: 2E4},
    408: {metal: 5E4, crystal: 5E4, deuterium: 0, retreat: 1E5},
    502: {metal: 8E3, crystal: 0, deuterium: 2E3, retreat: 0},
    503: {metal: 12500, crystal: 2500, deuterium: 1E4, retreat: 0},
    Mining: {1: 1, 2: 1, 3: 1, 4: 1, 12: 1, 22: 1, 23: 1, 24: 1, 25: 1, 26: 1, 27: 1, 212: 1},
    Station: {14: 1, 15: 1, 21: 1, 31: 1, 33: 1, 34: 1, 36: 1, 41: 1, 42: 1, 43: 1, 44: 1},
    Ship: {
        202: 1,
        203: 1,
        204: 2,
        205: 2,
        206: 2,
        207: 2,
        208: 1,
        209: 1,
        210: 1,
        211: 2,
        212: 3,
        213: 2,
        214: 2,
        215: 2
    },
    ShipCivil: {
        202: 1, 203: 1,
        208: 1, 209: 1, 210: 1
    },
    ShipCombat: {204: 2, 205: 2, 206: 2, 207: 2, 215: 2, 211: 2, 213: 2, 214: 2},
    ShipTransport: {203: 1, 202: 1, 209: 1, 214: 1},
    Defense: {401: 1, 402: 1, 403: 1, 404: 1, 405: 1, 406: 1, 407: 1, 408: 1, 502: 2, 503: 2},
    Resource: {metal: "091", crystal: "092", deuterium: "093"},
    ResourceEnergy: {metal: "091", crystal: "092", deuterium: "093", energy: "094"},
    Coordinates: {galaxy: 1, system: 1, position: 1},
    CoordinatesType: {galaxy: 1, system: 1, position: 1, type: 1},
    Type: {1: "planet", 2: "debris", 3: "moon"},
    Research: {
        106: 8, 108: 10, 109: 3, 110: 6, 111: 2, 113: 12, 114: 8,
        115: 6, 117: 6, 118: 8, 120: -12, 121: 5, 122: 7, 123: 0, 124: 8, 199: -1
    },
    ByName: {},
    Mission: {M15: 0, M07: 0, M08: 0, M03: 0, M04: 0, M06: 0, M05: 0, M01: 0, M02: 0, M09: 0},
    Init: function (a) {
        AGO.Item.ByName = a || {}
    },
    getByName: function (a) {
        return a ? AGO.Item.ByName[a] || "" : ""
    },
    check: function (a, b, c) {
        return (a = STR.check(a)
        ) && b && a in b ? a : STR.check(c)
    },
    valid: function (a) {
        return 1 <= +a && 503 >= +a && a in AGO.Item ? a : ""
    },
    create: function (a) {
        var b, c = {};
        "string" === typeof a && (a = [a]
        );
        for (b = 0; b < a.length; b++) {
            AGO.Item[a[b]] && OBJ.iterate(AGO.Item[a[b]], function (a) {
                    c[a] =
                        0
                }
            );
        }
        return c
    }
};
AGO.Ogame = {
    getFleetDistance: function (a, b) {
        var c;
        if (OBJ.is(a) && OBJ.is(b)) {
            if (c = Math.abs(a.galaxy - b.galaxy)) {
                if (AGO.Uni.donutGalaxy)
                    c > Math.floor(AGO.Uni.galaxies / 2) ? c = Math.abs(c - AGO.Uni.galaxies) : '';
                return 2E4 * c;
            }
            if (c = Math.abs(a.system - b.system)) {
                if (AGO.Uni.donutSystem)
                    c > Math.floor(AGO.Uni.systems / 2) ? c = Math.abs(c - AGO.Uni.systems) : '';
                return 95 * c + 2700;
            }
            if (c = Math.abs(a.position - b.position)) {
                return 5 * c + 1E3
            }
        }
        return 5
    }, getFleetDuration: function (a, b, c) {
        return a in AGO.Item.Ship && b ? Math.round((35E3 / (c || 10
            ) * Math.sqrt(10 * b / AGO.Ogame.getShipSpeed(a)) + 10
        ) / (+AGO.Uni.speedFleet || 1
        )
        ) : 0
    }, getShipConsumption: function (a, b, c) {
        return a in AGO.Item.Ship && AGO.Item[a].consumption && b && c ? (c = 35E3 / (c * AGO.Uni.speedFleet - 10
        ) * Math.sqrt(10 * b / AGO.Ogame.getShipSpeed(a)), (AGO.Item[a].consumption * b / 35E3 * (c / 10 + 1
            ) * (c / 10 + 1)
        ) * AGO.Uni.globalDeuteriumSaveFactor) : 0
    }, getShipCapacity: function (a) {
        let capacity = "210" === a && AGO.Uni.probeCargo ? AGO.Uni.probeCargo : AGO.Item[a].capacity;
        return Math.round(capacity * (1 + (AGO.Units.get("114") || 0) * (AGO.Uni.cargoHyperspaceTechMultiplier / 100)));
    }, getShipSpeed: function (a) {
        AGO.Ogame.initShipSpeed && (AGO.Ogame.initShipSpeed(), AGO.Ogame.initShipSpeed = null);
        return AGO.Item[a].speed
    }, initShipSpeed: function () {
        var a = 5070900 <= NMR.parseVersion(AGO.App.versionOGame);
        OBJ.iterate(AGO.Item.Ship, function (b) {
                var c,
                    d, e, f;
                "202" === b && 5 <= AGO.Units.get("117") ? (c = 1E4, d = "117", f = 20
                ) : "209" === b && 15 <= AGO.Units.get("118") ? a && (c = 6E3, d = "118", f = 900
                ) : "209" === b && 17 <= AGO.Units.get("117") ? a && (c = 4E3, d = "117", f = 600
                ) : "211" === b && 8 <= AGO.Units.get("118") ? (c = 5E3, d = "118", f = 1000
                ) : (c = AGO.Item[b].speed, d = AGO.Item[b].drive, f = AGO.Item[b].consumption
                );
                d && (e = "115" === d ? .1 : "117" === d ? .2 : .3, AGO.Item[b].speed = Math.floor(c * (10 + AGO.Units.get(d) * e * 10) / 10), AGO.Item[b].consumption = f)
            }
        )
    }, getDebris: function (a, b) {
        var c, d, e, f, g;
        var h = {}
        OBJ.copy(a, h);
        c = {metal: 0, crystal: 0};
        if (OBJ.is(h)) {
            for (e in b = b && AGO.Uni.defToTF, d = AGO.Uni.debrisFactor || .3, f = AGO.Uni.debrisFactorDef || .3, g = AGO.Uni.repairFactor || .7, h) {
                h[e] && (AGO.Item.Ship[e] ||
                    (b && 1 === AGO.Item.Defense[e] && (d = f) && (h[e] = h[e] * (1 - g)))
                ) && (c.metal += Math.floor(h[e] * Math.floor(AGO.Item[e].metal * d)), c.crystal += Math.floor(h[e] * Math.floor(AGO.Item[e].crystal * d))
                );
            }
        }
        c.total = c.metal + c.crystal;
        c.recs = Math.ceil(c.total / AGO.Ogame.getShipCapacity("209"));
        c.enough = 0 < c.total && c.total >= 1E3 * AGO.Option.get("M37", 2);
        return c
    }, chooseTopscore: function (a, b, c, d, e, f, g, k) {
        var h = Math.max(AGO.Uni.topScore, AGO.Option.get("S29", 2));
        return 1E5 > h ? a : 1E6 > h ? b : 5E6 > h ? c : 25E6 > h ? d : 5E7 > h ? e : 75E6 > h ? f : 1E8 > h ? g : k
    }, getConsumptionDeuterium: function (a, b) {
        var c;
        c = "12" === a ? 10 * b * Math.pow(1.1, b) : 0;
        return Math.floor(c) *
            AGO.Uni.speed
    }, getConsumptionEnergy: function (a, b) {
        var c;
        "1" === a ? Math.pow(1.1, b) : "2" === a ? Math.pow(1.1, b) : "3" === a && Math.pow(1.1, b);
        return (c = "1" === a || "2" === a ? 10 : "3" === a ? 20 : 0
        ) && 0 <= b ? Math.floor(c * b * Math.pow(1.1, b)) : 0
    }, getProductionEnergy: function (a, b) {
        var c, d;
        c = "4" === a ? 20 * b * Math.pow(1.1, b) : "12" === a ? 30 * b * Math.pow(1.05 + .01 * AGO.Units.get("113"), b) : "212" === a ? Math.round(Math.floor((AGO.Planets.Get("active", "temp") + 40 + 140
        ) / 6
        ) * b) : 0;
        AGO.Option.is("comstaff") ? d = 1.12 : AGO.Option.is("engineer") ? d = 1.1 : d = 1;
        return Math.round(d * c)
    }, getProductionResources: function (a,
                                         b
    ) {
        var c, d;
        c = "1" === a ? 30 * b * Math.pow(1.1, b) : "2" === a ? 20 * b * Math.pow(1.1, b) : "3" === a ? 10 * b * Math.pow(1.1, b) * (1.28 - .004 * AGO.Planets.Get("active", "temp")
        ) : 0;
        AGO.Option.is("comstaff") ? d = 1.12 : AGO.Option.is("geologist") ? d = 1.1 : d = 1;
        return Math.floor(d * c) * AGO.Uni.speed
    }, getStandardUnitsCache: null,
    getStandardUnits: function (a, b) {
        if (!AGO.Task.getStandardUnitsCache) {
            var c = AGO.Option.get("B32", 6).split(":");
            AGO.Task.getStandardUnitsCache = {
                metal: NMR.minMax((+c[0] || 2), 1, 5),
                crystal: NMR.minMax((+c[1] || 1), 1, 5),
                deuterium: NMR.minMax((+c[2] || 1), 1, 5)
            }
        }

        if (OBJ.is(a)) {
            switch (b) {
                case 1:
                    // crystal standard units
                    return Math.ceil((+a.metal || 0) * AGO.Task.getStandardUnitsCache.crystal / AGO.Task.getStandardUnitsCache.metal)
                        + (+a.crystal || 0)
                        + Math.ceil((+a.deuterium || 0) * AGO.Task.getStandardUnitsCache.crystal / AGO.Task.getStandardUnitsCache.deuterium);
                case 2:
                    // deuterium standard units
                    return Math.ceil((+a.metal || 0) * AGO.Task.getStandardUnitsCache.deuterium / AGO.Task.getStandardUnitsCache.metal)
                        + Math.ceil((+a.crystal || 0) * AGO.Task.getStandardUnitsCache.deuterium / AGO.Task.getStandardUnitsCache.crystal)
                        + (+a.deuterium || 0);
                default:
                    // metal standard units
                    return (+a.metal || 0)
                        + Math.ceil((+a.crystal || 0) * AGO.Task.getStandardUnitsCache.metal / AGO.Task.getStandardUnitsCache.crystal)
                        + Math.ceil((+a.deuterium || 0) * AGO.Task.getStandardUnitsCache.metal / AGO.Task.getStandardUnitsCache.deuterium);
            }
        }

        return 0;
    }, getAmortisation: function (a, b, c) {
        return OBJ.is(b) && 0 < c && (a = AGO.Ogame.getStandardUnits(b, +a - 1), 0 < a
        ) ? Math.floor(a / c * 3600) : 0
    }, getStorageCapacity: function (a) {
        return 5E3 * Math.floor(2.5 * Math.pow(Math.E, 20 * a / 33))
    }, getPlayerHonor: function (a) {
        if (a && 6 < a.length) {
            if (-1 <
                a.indexOf("rank_starlord1")) {
                return 1;
            }
            if (-1 < a.indexOf("rank_starlord2")) {
                return 2;
            }
            if (-1 < a.indexOf("rank_starlord3")) {
                return 3;
            }
            if (-1 < a.indexOf("rank_bandit1")) {
                return 5;
            }
            if (-1 < a.indexOf("rank_bandit2")) {
                return 6;
            }
            if (-1 < a.indexOf("rank_bandit3")) {
                return 7
            }
        }
        return 0
    }, getHonorClass: function (a) {
        return a ? " rank_starlord1 rank_starlord2 rank_starlord3  rank_bandit1 rank_bandit2 rank_bandit3".split(" ")[a] : ""
    },
    getJumpgateCooldown: function (moonID) {
        let level = AGO.Units.Data.Moons && AGO.Units.Data.Moons[moonID] && AGO.Units.Data.Moons[moonID][43] ? AGO.Units.Data.Moons[moonID][43] : 1;
        let cooldown = Math.round((14.9206 * Math.pow(level, 2) - 453.016 * level + 4038.1) / AGO.Uni.speedFleet);
        return cooldown;
    }
};
AGO.Units = {
    status: 0, Data: {}, Init: function (a) {
        AGO.Units.Data = a || {}
    }, Read: function () {
        OBJ.iterate(AGO.Item.ResourceEnergy, function (a) {
                AGO.Units.Data[a] = AGO.Units.Data[a + "Start"] = DOM.getText("resources_" + a, "id", 2)
            }
        );
        AGO.Units.Data.resources = AGO.Units.Data.metal + AGO.Units.Data.crystal + AGO.Units.Data.deuterium
    }, Run: function () {
        AGB.message("Units", "Update", {planet: AGO.Acc.planetId, data: AGO.Units.Data}, function () {
                AGO.Units.status = 1
            }
        )
    }, Timer: function () {
        OBJ.iterate(AGO.Item.Resource, function (a) {
                AGO.Units.Data[a] =
                    DOM.getText("resources_" + a, "id", 2)
            }
        );
        AGO.Units.Data.resources = AGO.Units.Data.metal + AGO.Units.Data.crystal + AGO.Units.Data.deuterium
    }, Update: function (a) {
        var b;
        b = new XMLHttpRequest;
        b.open("GET", AGO.Uni.url + "/game/index.php?page=fetchTechs&ajax=1", !0);
        b.setRequestHeader("Cache-Control", "no-cache");
        b.setRequestHeader("Pragma", "no-cache");
        b.overrideMimeType("text/html");
        b.onerror = b.onload = function () {
            var c, d;
            AGO.Init.status && (d = -1, 200 === +b.status && STR.check(b.responseText)[0] === String.fromCharCode(123) &&
                (d = 4, c = {
                        planet: "account",
                        tabs: ["Research"],
                        data: OBJ.parse(b.responseText)
                    }, AGB.message("Units", "Action", {
                            planets: AGO.Planets.ByCoordstype,
                            list: [c]
                        }
                    )
                ), AGB.Log("Update   - Units    : Research " + (-1 === d ? " failed !" : ""
                )
                ), a && a(d)
            )
        };
        b.send(null)
    }, get: function (a) {
        return +AGO.Units.Data[a] || 0
    }, set: function (a, b) {
        a && (AGO.Units.Data[a] = +b || 0
        )
    }, activeResources: function (a) {
        OBJ.is(a) && (OBJ.iterate(AGO.Item.Resource, function (b) {
                    a[b] = +AGO.Units.Data[b] || 0
                }
            ), a.resources = AGO.Units.Data.resources
        )
    }, activeProduction: function () {
        var a;
        a = OBJ.parse(AGO.Init.Script("production"));
        OBJ.iterate(AGO.Item.ResourceEnergy, function (b) {
                a[b] && OBJ.is(a[b].resources) && (AGO.Units.Data[b + "Storage"] = +a[b].resources.max || 0, AGO.Units.Data[b + "Production"] = +a[b].resources.production || 0
                )
            }
        )
    }
};
AGO.Time = {
    status: 0,
    serverTime: 0,
    ogameTime: 0,
    timeZoneDelta: 0,
    localTime: Date.now(),
    localTimeDelta: 0,
    localTimeRun: 0,
    duration: 0,
    durationRun: 0,
    Read: function () {
        var a;
        AGO.Time.serverTime = (new Date
        ).setTime(1E3 * AGO.Acc.timestamp);
        AGO.Time.localTimeDelta = AGO.Time.localTime - AGO.Time.serverTime;
        AGO.Time.localTimeDeltaAverage = AGO.Time.localTimeDelta;
        AGO.Time.localTimeRun = Date.now();
        AGO.Time.pageDeltaRun = AGO.Time.localTimeRun - AGO.Time.localTime;
        (a = AGO.App.login ? 0 : AGO.Option.get("delta", 2)
        ) && 1200 > Math.abs(AGO.Time.localTimeDeltaAverage -
            a
        ) && (AGO.Time.localTimeDeltaAverage = Math.floor((9 * a + AGO.Time.localTimeDeltaAverage
            ) / 10
            )
        );
        AGO.Option.set("delta", AGO.Time.localTimeDeltaAverage);
        if (a = (a = document.getElementById("bar")
        ) ? a.querySelector(".OGameClock") : null) {
            AGO.Time.status = 1, AGO.Time.ogameTime = AGO.Time.parse(a.textContent).getTime(), AGO.Time.timeZoneDelta = -(1E4 * Math.round((AGO.Time.ogameTime - AGO.Time.serverTime
                ) / 1E4
                )
            )
        }
    },
    Run: function () {
        var a, b, c, d, e;
        if (b = (a = document.getElementById("bar")
        ) ? a.querySelector(".OGameClock") : null) {
            if (AGO.Option.is("A31") &&
            AGO.Time.timeZoneDelta && (AGO.Time.status = 2, DOM.innerHTML(b, null, AGO.Time.format(AGO.Time.ogameTime, "[d].[m].[Y] <span>[H]:[i]:[s]</span>")), AGO.Option.is("A32") && (AGO.Time.status = 3, d = AGO.Time.format(AGO.Time.ogameTime, "[d].[m].[Y] [H]:[i]:[s]", !0)
                ), b.title = AGO.Label.get("A38"), DOM.addClass(b, null, "tooltip"), c = document.createElement("li"), c.setAttribute("style", "float: right; color: #848484; font-weight: 700;"), c.textContent = b.title[0], DOM.after(b, c)
            ), AGO.Option.is("A34") && (e = (0 < AGO.Time.localTimeDelta ? " (+" :
                        " (-"
                ) + Math.floor(Math.abs(AGO.Time.localTimeDelta) / 100) / 10 + (AGO.Label.is("KD0S") || "s"
                ) + ")  " + AGO.Time.format(AGO.Time.ogameTime, "[H]:[i]:[s]")
            ), d || e) {
                b = document.createElement("div"), b.className = "ago_clock", e && (c = b.appendChild(document.createElement("span")), c.textContent = e
                ), d && (c = b.appendChild(document.createElement("span")), c.id = "ago_clock_server", c.className = "tooltip", c.title = AGO.Label.get("A39"), c.textContent = d
                ), DOM.appendChild(a, b)
            }
        }
    },
    Display: function () {
        var a;
        a = Date.now();
        AGO.Time.duration = a - AGO.Time.localTime;
        AGO.Time.durationRun = AGO.Time.duration - AGO.Time.pageDeltaRun;
        3 === AGO.Time.status && (a = a - AGO.Time.localTimeDelta - AGO.Time.timeZoneDelta, DOM.setText("ago_clock_server", "id", AGO.Time.format(a, "[d].[m].[Y] [H]:[i]:[s]", !0))
        )
    },
    timestamp: function () {
        return Math.floor(Date.now() / 1E3)
    },
    timestampMinute: function () {
        return Math.floor((Date.now() - 1381E9
        ) / 6E4
        )
    },
    getFinishTime: function (a) {
        return (new Date
        ).setTime(AGO.Time.ogameTime + AGO.Time.duration + 1E3 * (+a || 0
        )
        )
    },
    format: function (a, b, c) {
        function d(a) {
            return 0 > a || 9 <
            a ? a : "0" + a
        }

        return a ? (!OBJ.is(a) && 500 < a && (a = new Date(a)
                ), 1 < AGO.Time.status && !c && a.setTime(a.getTime() + AGO.Time.timeZoneDelta), b || (b = new Date, b = b.getFullYear() !== a.getFullYear() ? "[d].[m].[Y] [H]:[i]:[s]" : b.getMonth() !== a.getMonth() || b.getDate() !== a.getDate() ? "[d].[m] [H]:[i]:[s]" : "[H]:[i]:[s]"
                ), b.split("[d]").join(d(a.getDate())).split("[m]").join(d(a.getMonth() + 1)).split("[Y]").join(a.getFullYear()).split("[y]").join(a.getFullYear().toString().substr(2, 4)).split("[H]").join(d(a.getHours())).split("[i]").join(d(a.getMinutes())).split("[s]").join(d(a.getSeconds()))
            ) :
            ""
    },
    formatTimestamp: function (a, b) {
        return 1E6 < a ? AGO.Time.format(1E3 * a, b || "[d].[m].[Y] [H]:[i]:[s]", !0) : ""
    },
    formatTime: function (a, b) {
        var c, d, e, f, g, k, h;
        h = a;
        b && (d = Math.floor(h / 86400 / 365), h -= 31536E3 * d, e = Math.floor(h / 86400 / 7), h -= 604800 * e, f = Math.floor(h / 86400), h -= 86400 * f
        );
        g = Math.floor(h / 3600);
        h -= 3600 * g;
        k = Math.floor(h / 60);
        h -= 60 * k;
        return b ? (AGO.Time.formatTimeCacheCreate(), c = [], d && c.push(d + AGO.Time.formatTimeCache.years), e && c.push(e + AGO.Time.formatTimeCache.weeks), f && c.push(f + AGO.Time.formatTimeCache.days),
            g && 3 > c.length && c.push(g + AGO.Time.formatTimeCache.hours), k && 3 > c.length && c.push(k + AGO.Time.formatTimeCache.minutes), h && 3 > c.length && c.push(h + AGO.Time.formatTimeCache.seconds), c.join(" ")
        ) : (0 > g || 9 < g ? g : "0" + g
        ) + ":" + (0 > k || 9 < k ? k : "0" + k
        ) + ":" + (0 > h || 9 < h ? h : "0" + h
        )
    },
    parseFormatedTime: function (a) {
        var b = 0, c, d, e;
        if (a) {
            for (AGO.Time.formatTimeCacheCreate(), a = a.trim().split(" ").reverse(), e = 0; e < a.length; e++) {
                d = NMR.parseIntAbs(a[e]), c = (a[e] || ""
                ).replace(/\d/g, "").trim(), c === AGO.Time.formatTimeCache.seconds && 0 === e ? b += d : c ===
                AGO.Time.formatTimeCache.minutes ? b += 60 * d : c === AGO.Time.formatTimeCache.hours ? b += 3600 * d : c === AGO.Time.formatTimeCache.days ? b += 86400 * d : c === AGO.Time.formatTimeCache.weeks ? b += 604800 * d : c === AGO.Time.formatTimeCache.years && (b += 31536E3 * d
                );
            }
        }
        return b
    },
    formatTimeCacheCreate: function () {
        AGO.Time.formatTimeCache || (AGO.Time.formatTimeCache = {
                years: AGO.Label.is("KD0Y") || "y",
                weeks: AGO.Label.is("KD0W") || "w",
                days: AGO.Label.is("KD0D") || "d",
                hours: AGO.Label.is("KD0H") || "h",
                minutes: AGO.Label.is("KD0M") || "m",
                seconds: AGO.Label.is("KD0S") ||
                "s"
            }
        )
    },
    parseTime: function (a) {
        a = "string" === typeof a ? a.replace(/[^0-9:]/g, "").split(":") : [];
        return 3 === a.length ? 3600 * (+a[0] || 0
        ) + 60 * (+a[1] || 0
        ) + (+a[2] || 0
        ) : 0
    },
    convertLocal: function (a, b) {
        var c;
        return a && 1 < AGO.Time.status ? (b || (b = "[d].[m].[Y] [H]:[i]:[s]"
            ), (c = AGO.Time.parse(a, b)
            ) ? AGO.Time.format(c, b) : a || ""
        ) : a || ""
    },
    parse: function (a, b) {
        b || (b = "[d].[m].[Y] [H]:[i]:[s]"
        );
        a = a.toString();
        var c = b.match(/\[[dmyYHis]\]/g);
        if (!c || !c.length) {
            return null;
        }
        var d;
        d = b.replace(/\./g, "\\.");
        d = d.replace(/\//g, "\\/");
        d = d.replace(/\-/g,
            "\\-"
        );
        for (var e = {}, f = 0; f < c.length; f++) {
            var g = c[f];
            d = "[Y]" === g ? d.replace(g, "(\\d{4,4})") : "[y]" === g ? d.replace(g, "(\\d{2,2})") : d.replace(g, "(\\d{1,2})");
            g = g.substr(1, 1);
            e[g] = f + 1
        }
        c = a.match(new RegExp(d, ""));
        if (!c || !c.length) {
            return null;
        }
        d = new Date;
        d.setMilliseconds(0);
        d.setSeconds(0);
        d.setMinutes(0);
        d.setHours(0);
        c[e.s] && d.setSeconds(c[e.s]);
        c[e.i] && d.setMinutes(c[e.i]);
        c[e.H] && d.setHours(c[e.H]);
        c[e.Y] ? d.setFullYear(c[e.Y]) : c[e.y] && (f = d.getFullYear(), f = 100 * Math.floor(f / 100) + c[e.y], f > d.getFullYear() &&
            (f -= 100
            ), d.setFullYear(f)
        );
        c[e.d] && d.setDate(1);
        c[e.m] && d.setMonth(c[e.m] - 1);
        c[e.d] && d.setDate(c[e.d]);
        return d
    },
    parseDateTime: function (a, b) {
        var c, d, e;
        if (a = STR.check(a)) {
            if (d = a.match(/([^\d:]|\b)\d{1,2}\.\d{1,2}(\.\d{2}|\.\d{4})*\s+\d{1,2}:\d{1,2}:\d{1,2}([^\d:]|\b)/)) {
                d = STR.check(d[0]).replace(/[^\d:\.\s]/g, "").replace(/ +/g, " ").trim().split(" "), c = STR.check(d[0]).split("."), e = STR.check(d[1]).split(":");
            } else if (d = a.match(/([^\d:]|\b)\d{1,2}:\d{1,2}:\d{1,2}([^\d:]|\b)/)) {
                c = [], e = STR.check(d[0]).replace(/[^\d:]/g,
                    ""
                ).trim().split(":");
            }
            if (OBJ.is(e) && e.length && 24 > e[0] && 60 > e[1] && 60 > e[2] && (d = new Date, d.setMilliseconds(0), d.setSeconds(+e[2] || 0), d.setMinutes(+e[1] || 0), d.setHours(+e[0] || 0), 3 === c.length && (2E3 < c[2] ? d.setFullYear(+c[2] || 0) : 100 > c[2] && (e = 100 * Math.floor(d.getFullYear() / 100) + (+c[2] || 0
                        ), e > d.getFullYear() && (e -= 100
                        ), d.setFullYear(e)
                    )
                ), 2 <= c.length && (d.setDate(1), d.setMonth((+c[1] || 0
                    ) - 1
                    ), d.setDate(+c[0] || 0)
                ), c = Math.floor(d.getTime() / 1E3), 1E9 < c
            )) {
                return b ? c : d
            }
        }
        return 0
    }
};
AGO.Task = {
    Info: "galaxy system position type mission speed holdingtime expeditiontime union routine name detail detail2 preferCargo preferShip arrival metal crystal deuterium preferResource timeResource timeShip 202 203 204 205 206 207 208 209 210 211 212 213 214 215".split(" "),
    valid: function (a) {
        return STR.check(a).replace(/[\"\:]/g, "").trim()
    },
    create: function (a, b) {
        var c = {}, d;
        a = a || {};
        for (d = 0; 15 >= d; d++) {
            c[AGO.Task.Info[d]] = 10 > d || 12 === d || 15 === d ? +a[AGO.Task.Info[d]] || 0 : a[AGO.Task.Info[d]] || "";
        }
        if (1 <= b) {
            for (d =
                     16; 20 >= d; d++) {
                c[AGO.Task.Info[d]] = +a[AGO.Task.Info[d]] || 0;
            }
        }
        if (2 <= b) {
            for (d = 21; 35 >= d; d++) {
                c[AGO.Task.Info[d]] = +a[AGO.Task.Info[d]] || 0;
            }
        }
        return c
    },
    splitActive: function (a, b, c, d) {
        var e, f;
        e = OBJ.split(a);
        if (e.standard && e[AGO.Acc.coordstype]) {
            a = AGO.Task.split(e.standard, b, -1);
            b = AGO.Task.split(e[AGO.Acc.coordstype], b, -1);
            for (f in b) {
                b[f] && (a[f] = d || "string" === typeof b[f] ? b[f] : Math.max(b[f], 0)
                );
            }
            AGO.Task.updateCoords(a, c);
            a.resources = a.metal + a.crystal + a.deuterium;
            a.ships = 0;
            for (f in AGO.Item.Ship) {
                0 < a[f] && (a.ships += a[f]
                );
            }
            return a
        }
        return AGO.Task.split(e[AGO.Acc.coordstype] || e.standard, b, c)
    },
    split: function (a, b, c) {
        var d, e;
        d = STR.check(a).split(":");
        a = {
            galaxy: +d[0] || 0,
            system: +d[1] || 0,
            position: +d[2] || 0,
            type: +d[3] || 0,
            mission: +d[4] || 0,
            speed: +d[5] || 0,
            holdingtime: +d[6] || 0,
            expeditiontime: +d[7] || 0,
            union: +d[8] || 0,
            routine: +d[9] || 0,
            name: d[10] || "",
            detail: d[11] || "",
            detail2: +d[12] || 0,
            preferCargo: d[13] || "",
            preferShip: d[14] || "",
            arrival: +d[15] || 0
        };
        0 <= c && AGO.Task.updateCoords(a, c);
        1 <= b && (a.metal = +d[16] || 0, a.crystal = +d[17] || 0, a.deuterium =
                +d[18] || 0, a.preferResource = +d[19] || 0, a.timeResource = +d[20] || 0, a.resources = a.metal + a.crystal + a.deuterium
        );
        if (2 <= b) {
            for (a.ships = 0, a.shipsCivil = 0, a.shipsCombat = 0, a.timeShip = +d[21] || 0, e = 22; 35 >= e; e++) {
                c = String(e + 180), b = +d[e] || 0, (a[c] = b
                ) && "212" !== c && (a.ships += b, c in AGO.Item.ShipCivil && (a.shipsCivil += b
                    ), c in AGO.Item.ShipCombat && (a.shipsCombat += b
                    )
                );
            }
        }
        return a
    },
    splitCoords: function (a) {
        a = STR.check(a).split(":");
        return {galaxy: +a[0] || 0, system: +a[1] || 0, position: +a[2] || 0}
    },
    join: function (a, b) {
        var c, d;
        if (OBJ.is(a)) {
            c =
                [
                    a.galaxy || "",
                    a.system || "",
                    a.position || "",
                    a.type || "",
                    a.mission || "",
                    a.speed || "",
                    a.holdingtime || "",
                    a.expeditiontime || "",
                    a.union || "",
                    a.routine || "",
                    a.name || "",
                    a.detail || "",
                    a.detail2 || "",
                    a.preferCargo || "",
                    a.preferShip || "",
                    a.arrival || ""
                ];
            1 <= b && (c[16] = a.metal || "", c[17] = a.crystal || "", c[18] = a.deuterium || "", c[19] = a.preferResource || "", c[20] = a.timeResource || ""
            );
            if (2 <= b) {
                for (c[21] = a.timeShip || "", d = 22; 35 >= d; d++) {
                    c[d] = a[String(d + 180)] || "";
                }
            }
            return c.join(":") || ""
        }
        return ""
    },
    updateCoords: function (a, b, c) {
        OBJ.is(a) && (!c &&
            AGO.Task.checkCoords(a.galaxy, a.system, a.position) ? a.coords = a.galaxy + ":" + a.system + ":" + a.position : OBJ.is(c) && AGO.Task.checkCoords(c.galaxy, c.system, c.position) ? (a.galaxy = c.galaxy, a.system = c.system, a.position = c.position, a.coords = a.galaxy + ":" + a.system + ":" + a.position
            ) : b && (c || (c = a
                ), 2 >= b ? (a.galaxy = 2 === b ? AGO.Acc.galaxy : 0, a.system = 2 === b ? AGO.Acc.system : 0, a.position = 2 === b ? AGO.Acc.position : 0
                ) : (a.galaxy = NMR.isMinMax(c.galaxy, 1, AGO.Uni.galaxies) ? c.galaxy : 3 === b ? AGO.Acc.galaxy : 0, a.system = NMR.isMinMax(c.system, 1,
                        AGO.Uni.systems
                    ) ? c.system : 3 === b ? AGO.Acc.system : 0, a.position = NMR.isMinMax(c.position, 1, AGO.Uni.positions) ? c.position : 3 === b ? AGO.Acc.position : 0
                ), a.coords = 1 === b ? "" : a.galaxy + ":" + a.system + ":" + a.position
            ), a.owncoords = AGO.Planets.owncoords(a.coords, a.type), a.coordstype = a.coords && a.type ? a.coords + ":" + a.type : ""
        )
    },
    updateCoordsType: function (a, b) {
        var c;
        b = STR.check(b);
        OBJ.is(a) && (c = b.split(":"), NMR.isMinMax(+c[3], 1, 3) && (a.type = +c[3] || 0
            ), AGO.Task.checkCoords(+c[0], +c[1], +c[2]) ? (a.galaxy = +c[0] || 0, a.system = +c[1] ||
                    0, a.position = +c[2] || 0, a.coords = a.galaxy + ":" + a.system + ":" + a.position, a.coordstype = a.type ? a.coords + ":" + a.type : "", a.owncoords = AGO.Planets ? AGO.Planets.owncoords(a.coords, a.type) : 0
            ) : (delete a.coords, delete a.coordstype, delete a.owncoords
            )
        )
    },
    updateResources: function (a) {
        OBJ.is(a) && (a.metal = +a.metal || 0, a.crystal = +a.crystal || 0, a.deuterium = +a.deuterium || 0, a.resources = a.metal + a.crystal + a.deuterium, a.timeResource = +a.timeResource || 1
        )
    },
    updateStandardUnits: function (a) {
        OBJ.is(a) && (a.standardunits = AGO.Ogame.getStandardUnits(a,
                AGO.Option.get("B35", 2)
            )
        )
    },
    addResources: function (a, b) {
        OBJ.is(a) && (OBJ.is(b) && b.timeResource ? (OBJ.iterate(AGO.Item.Resource, function (c) {
                        a[c] = (a[c] || 0
                        ) + (b[c] || 0
                        )
                    }
                ), a.resources = a.metal + a.crystal + a.deuterium, a.timeResource = a.timeResource || -1
            ) : a.timeResource = a.timeResource ? -1 : 0
        )
    },
    addShips: function (a, b) {
        OBJ.is(a) && (OBJ.is(b) && b.timeShip ? (a.shipsCivil = 0, a.shipsCombat = 0, OBJ.iterate(AGO.Item.ShipCivil, function (c) {
                        a[c] = (a[c] || 0
                        ) + (b[c] || 0
                        );
                        a.shipsCivil += a[c]
                    }
                ), OBJ.iterate(AGO.Item.ShipCombat, function (c) {
                        a[c] =
                            (a[c] || 0
                            ) + (b[c] || 0
                            );
                        a.shipsCombat += a[c]
                    }
                ), a.ships = a.shipsCivil + a.shipsCombat, a.timeShip = a.timeShip || -1
            ) : a.timeShip = a.timeShip ? -1 : 0
        )
    },
    updateShips: function (a) {
        var b;
        if (OBJ.is(a)) {
            for (b in a.ships = 0, a.shipsCivil = 0, a.shipsCombat = 0, AGO.Item.Ship) {
                a[b] && "212" !== b ? (a.ships += a[b], b in AGO.Item.ShipCivil && (a.shipsCivil += a[b]
                    ), b in AGO.Item.ShipCombat && (a.shipsCombat += a[b]
                    )
                ) : a[b] = 0
            }
        }
    },
    checkCoords: function (a, b, c) {
        return 1 <= a && a <= AGO.Uni.galaxies && 1 <= b && b <= AGO.Uni.systems && 1 <= c && c <= AGO.Uni.positions
    },
    checkCoordsPart: function (a,
                               b
    ) {
        return NMR.minMax(a, 1, {
            galaxy: AGO.Uni.galaxies,
            system: AGO.Uni.systems,
            position: AGO.Uni.positions
        }[b] || 0
        )
    },
    cutSystem: function (a) {
        return "string" === typeof a ? a.split(":", 2).join(":") : ""
    },
    cutCoords: function (coords) {
        return "string" === typeof coords ? coords.split(":", 3).join(":") : "";
    },
    cutCoordsType: function (a) {
        return "string" === typeof a ? a.split(":", 4).join(":") : ""
    },
    parseTarget: function (a) {
        var b = {}, c, d;
        if (a = STR.check(a)) {
            (c = a.match(/([^\d:]|\b)t\s{0,2}\d{1,2}:\d{1,3}:\d{1,2}(:\d)*([^\d:]|\b)/i)
            ) && c[0] && (d = c[0], a = ""
            ), (c = a.match(/([^\d:]|\b)\d{1,2}\.\d{1,2}(\.\d{2}|\.\d{4})*([^\d:]|\b)/)
            ) &&
            c[0] && (d = c[0] + " " + a.split(c[0])[1], a = a.split(c[0])[0]
            ), (c = a.match(/([^\d:]|\b)\d{1,2}:\d{1,3}:\d{1,2}(:\d)*([^\d:]|\b)/)
            ) && c[0] && (d || (d = a.split(c[0])[1]
                ), AGO.Task.updateCoordsType(b, c[0].replace(/[^\d:]/g, ""))
            ), d && (b.time = AGO.Time.parseDateTime(d, !0)
            );
        }
        return b
    },
    trimCoords: function (a) {
        var b, c;
        return (a = STR.check(a)
        ) ? (b = a.lastIndexOf("["), c = a.lastIndexOf("]"), a.slice(-1 < b ? b + 1 : 0, -1 < c ? c : a.length).trim()
        ) : ""
    }
};
AGO.Token = {
    Info: {}, Messages: function (a, b) {
        "Action" === a && AGO.Token.Action(b)
    }, Init: function (a, b) {
        OBJ.is(a) && (OBJ.is(a.Info) ? (AGO.Token.Data = a, AGO.Token.Info = a.Info
            ) : AGO.Token.Info = a
        );
        b && (AGO.Token.getPlayerStatusList = null
        )
    }, Action: function (a) {
        OBJ.is(a) && (a.keyPlayer = AGO.App.keyPlayer, a.refresh = "galaxy" === AGO.App.page, AGB.message("Token", "Action", a, function (b) {
                    b && b.changed && (b.marked = a.marked, b.Data && (AGO.Token.Data = b.Data, b.Data = null
                        ), AGO.Init.Messages("Panel", "Action", b)
                    )
                }
            )
        )
    }, getPlayerStatus: function (a,
                                  b
    ) {
        var c, d, e, f, g, k;
        if (!AGO.Token.getPlayerStatusList) {
            for (AGO.Token.getPlayerStatusList = {}, g = 21; 30 >= g; g++) {
                AGO.Token.Info[g] && AGO.Token.Info[g].cls && (AGO.Token.getPlayerStatusList["status_abbr_" + AGO.Token.Info[g].cls] = g
                );
            }
        }
        e = 0;
        c = DOM.queryAll(a, b);
        for (k = 0; k < c.length; k++) {
            for (d = (c[k].className || ""
            ).split(" "), g = 0; g < d.length; g++) {
                (f = (d[g] || ""
                    ).trim()
                ) && (e = Math.max(AGO.Token.getPlayerStatusList[f], e)
                );
            }
        }
        return e
    }, getClass: function (a) {
        return a && AGO.Token.Info[a] ? "status_abbr_" + (AGO.Token.Info[a].cls || a
        ) : ""
    }, getClassSelection: function (a) {
        return 3 >=
        a ? "ago_selection_S" + a : "ago_selection_" + a
    }, getClassSelected: function (a, b) {
        return "ago_selected ago_selected_" + (3 >= a ? "S" + a : a
        ) + (b ? "_own" : ""
        )
    }, getClassHover: function (a, b) {
        return "ago_hover ago_hover_" + (3 >= a ? "S" + a : a
        ) + (b ? "_own" : ""
        )
    }, getClassHighlight: function (a, b) {
        return "ago_highlight ago_highlight_" + (3 >= a ? "S" + a : a
        ) + (b ? "_active" : ""
        )
    }, getColor: function (a) {
        return a && AGO.Token.Info[a] ? AGO.Token.Info[a].color || "" : ""
    }, getCondition: function (a) {
        return a && AGO.Token.Info[a] ? AGO.Token.Info[a].condition : 0
    }, getLimit: function (a) {
        return a &&
        AGO.Token.Info[a] ? AGO.Token.Info[a].limit : 0
    }, getLabel: function (a) {
        return a && AGO.Token.Info[a] ? AGO.Token.Info[a].name || AGO.Label.get("C" + a) : ""
    }, valid: function (a) {
        return a ? (a + ""
        ).replace(/\|/g, "") : ""
    }, getColorOpacity: function (a, b) {
        var c;
        return a && AGO.Token.Info[a] && AGO.Token.Info[a].color ? (c = +AGO.Token.Info[a].opacity || (80 > a ? AGO.Option.get("CT2", 2) : AGO.Styles.opacity
            ) || 100, "INHERIT" === AGO.Token.Info[a].color ? c / 100 : HTML.color(AGO.Token.Info[a].color, b ? 2 * c : c)
        ) : ""
    }
};
AGO.Fleet = {
    Data: {}, Task: {}, Next: {}, Init: function (a) {
        AGO.Fleet.Data = a || {};
        AGO.Fleet.Data.Current = AGO.Data.getStorage(AGO.App.keyPlayer + "_Fleet_Current", "JSON")
    }, Content: function (a, b, c, d) {
        b = OBJ.parse(d);
        "fetcheventbox" === a ? "friendly" in b && (AGO.Fleet.Set("Current", "fleets", +b.friendly || 0), AGO.Init.Messages("Panel", "updateTab", {tab: "Flights"})
        ) : "minifleet" === a && b.response && ("slots" in b.response && (AGO.Fleet.Set("Current", "fleets", +OBJ.get(b.response, "slots") || 0), AGO.Init.Messages("Panel", "updateTab", {tab: "Flights"})
            ),
                AGO.Init.Messages("Page", "sendShips", {mode: "finish", success: b.response.success})
        )
    }, Set: function (a, b, c) {
        a && AGO.Fleet.Data[a] && (b = "string" === typeof b ? OBJ.createKey(b, c) : b, OBJ.iterate(b, function (c) {
                    AGO.Fleet.Data[a][c] = b[c]
                }
            ), "Current" === a ? AGO.Data.setStorage(AGO.App.keyPlayer + "_Fleet_Current", AGO.Fleet.Data.Current) : AGB.message("Fleet", "Set", {
                    tab: a,
                    data: b
                }
            )
        )
    }, Get: function (a, b, c) {
        a = a && AGO.Fleet.Data[a] && (b || 0 === b
        ) ? AGO.Fleet.Data[a][b] : "";
        return 6 === c ? STR.check(a) : +a || 0
    }
};
AGO.DataBase = {
    status: 0, enabled: !1, Data: {}, Info: {Player: "D36", Universe: "D37"}, Messages: function (a, b) {
        "Notify" === a && AGO.DataBase.Notify(b)
    }, Init: function (a) {
        AGO.DataBase.Data = OBJ.is(a) ? a : {};
        AGO.DataBase.status = AGO.DataBase.Data.status || 0;
        AGO.DataBase.enabled = 1 === AGO.DataBase.Data.status
    }, Notify: function (a) {
        var b;
        OBJ.is(a) && (b = AGO.DataBase.Info[a.tab]
        ) && ("loading" in a ? AGO.Notify.set(b, 3, " " + a.loading + " %") : (AGO.DataBase.Init(a), AGO.Notify.set(b, 4, " (" + OBJ.get(AGO.DataBase.Data[a.tab], "entries") + ")")
            )
        )
    }
};
AGO.Tools = {
    List: ["A", "B", "C", "D", "E", "F", 1, 2, 3, 4, 5, 6, 7, 8, 9], Messages: function (a, b) {
        "Action" === a && AGO.Tools.Action(b)
    }, Action: function (a) {
        a && (a.keyPlayer = AGO.App.keyPlayer, a.planetId = AGO.Acc.planetId, a.coords = AGO.Acc.coords, a.coordstype = AGO.Acc.coordstype, a.type = AGO.Acc.type, a.planetName = AGO.Acc.planetName, a.Planets = {}, AGO.Planets.iterate(1, function (b, c) {
                    a.Planets[c] = {
                        name: b.name,
                        temp: b.temp
                    }
                }
            ), AGB.message("Tools", "Action", a, function (b) {
                    var c;
                    b && b.href && (c = document.getElementById("ago_tools_send") ||
                            document.body.appendChild(document.createElement("a")), c.id = "ago_tools_send", c.href = b.href, c.style.display = "none", c.target = a.shiftKeys || AGO.Option.is("T01") ? "_blank" : "ago_tools_" + b.id, DOM.click(c)
                    )
                }
            )
        )
    }
};

AGO.Jumpgate = {
    updateCooldownStatus: 0, Messages: function (a, b) {
        "Continue" === a && AGO.Jumpgate.Continue(b)
    }, Unload: function (a) {
        a && a.target && "DIV" === a.target.nodeName && -1 < (a.target.className || ""
        ).indexOf("ui-dialog") && (AGO.Jumpgate.Timer = null, AGO.Init.Messages("Planets", "Action", {mode: "select"})
        )
    }, onKeydown: function (a, b) {
        if (13 === a.keyCode) {
            return document.activeElement.blur(), DOM.click(".secondcol input.btn_blue", b), !1;
        }
        if (65 === a.keyCode) {
            return DOM.click(".secondcol #sendall", b), !1;
        }
        if (77 === a.keyCode) {
            return DOM.click(".secondcol #sendmost",
                b
            ), !1;
        }
        if (81 === a.keyCode) {
            return DOM.click(".secondcol .send_none a", b), !1;
        }
        if (38 === a.keyCode || 40 === a.keyCode) {
            if (11 === a.inputType && a.target.id && AGO.Item.Ship[STR.check(NMR.parseIntAbs(a.target.id))]) {
                return DOM.changeInput(a, a.target)
            }
        } else if (112 <= a.keyCode && 123 >= a.keyCode && AGO.Option.is("U32") && !a.cached) {
            return AGO.Jumpgate.Action(AGO.Planets.GetByIndex(a.keyCode - 111, "moon", 6)), !1;
        }
        return !0
    }, Content: function (a) {
        function b(a, b) {
            var c, g;
            c = DOM.appendTR(a, "tooltip");
            c.addEventListener("click", d, !1);
            g = DOM.appendTD(c,
                "ago_jumpgate_settings_name tooltip", b, 10
            );
            g.title = g.textContent;
            g = DOM.appendTD(c, "ago_jumpgate_settings_status");
            DOM.append(g, "input", {id: "ago_jumpgate_settings_status_" + b, type: "checkbox", rel: b})
        }

        function d(a) {
            var b, c;
            a && a.currentTarget && (b = a.currentTarget.querySelector("input"), c = DOM.getAttribute(b, null, "rel"), b && c && ("INPUT" !== a.target.nodeName && (b.checked = !b.checked
                    ), AGO.Option.set(c, b.checked ? 1 : 0, 1), AGO.Global.message({
                            role: "Data",
                            data: {
                                G33: AGO.Option.is("G33"),
                                G34: AGO.Option.is("G34")
                            }
                        }
                    )
                )
            )
        }

        function c(a) {
            a &&
            AGO.Init.Messages("Panel", "hover", "mouseover" === a.type)
        }

        function f() {
            AGB.message("Units", "List", {action: "summarized"}, function (a) {
                    var b, c;
                    b = document.querySelectorAll("#ago_jumpgate_target > tr");
                    for (k = 0; k < b.length; k++) {
                        c = DOM.getAttribute(b[k], null, "ago-data", -2).data, OBJ.get(a[c], "timeShip") && DOM.updateText("td.ago_jumpgate_target_ships", b[k], OBJ.get(a[c], "ships"), 2)
                    }
                }
            )
        }

        var e, g, h, k;
        a = a ? a.querySelector("#jumpgate") : null;
        if (AGO.Option.is("G30") && !AGO.App.OgameMobile && DOM.updateAttribute(a, null, "ago-status",
            1, 8
        )) {
            AGO.Option.is("G31") && DOM.addClass(a, null, "ago_jumpgate_improve");
            AGO.Jumpgate.Mini = AGO.Task.splitActive(AGO.Option.get("G38", -1), 2, -1);
            AGO.Jumpgate.Maxi = {};
            e = a.querySelectorAll(".ship_selection_table .ship_txt_row > a");
            for (k = 0; k < e.length; k++) {
                (h = STR.check(DOM.getAttribute("img", e[k], "class", 3))
                ) && (AGO.Jumpgate.Maxi[h] = DOM.getText(".quantity", e[k].parentNode, 3)
                ), DOM.appendChild(e[k], e[k].parentNode.children[1]);
            }
            e = {planet: AGO.Acc.planetId, tabs: ["Ship"], data: OBJ.create(AGO.Jumpgate.Maxi)};
            AGB.message("Units",
                "Action", {list: [e]}
            );
            h = DOM.appendSPAN(null, "float_left send_most");
            DOM.appendA(h, {
                    id: "sendmost",
                    "class": "tooltip",
                    title: AGO.Label.get("F37")
                }, {click: AGO.Jumpgate.setMostShips}
            );
            DOM.after(a.querySelector(".secondcol .send_all"), h);
            AGO.Jumpgate.Target = [];
            if ((e = a.querySelector('#jumpgateForm select[name="zm"]')
            ) && e.options) {
                for (k = 0; k < e.options.length; k++) {
                    h = AGO.Task.trimCoords(e.options[k].textContent), h = AGO.Planets.GetByCoords(h, "index") || 80 + AGO.Jumpgate.Target.length, AGO.Jumpgate.Target[h] = {
                        value: e.options[k].value,
                        text: e.options[k].textContent
                    };
                }
                AGO.Option.is("G32") && (h = document.createElement("option"), h.value = "none", h.textContent = " - ", DOM.prependChild(e, h), a.querySelector("#jumpgateDefaultTargetSelectionForm option[selected]") || (e.selectedIndex = 0
                    )
                );
                e.onchange = AGO.Jumpgate.Display
            }
            AGO.Jumpgate.Target.length ? (AGO.Option.is("G31") && (DOM.setStyleDisplay("#jumpgate h4", a), DOM.setStyleDisplay("#selecttarget > .fright", a), g = DOM.appendTABLE(null, {id: "ago_jumpgate_target"}, {width: "378px"}, [
                            20,
                            60,
                            90,
                            26,
                            24,
                            90,
                            65
                        ]
                    ), g.addEventListener("click",
                        AGO.Jumpgate.clickTarget, !1
                    ), g.addEventListener("dblclick", AGO.Jumpgate.clickTarget, !1), AGO.Planets.iterate(3, function (a, b) {
                            if (b && (AGO.Jumpgate.Target[a.index] || b === AGO.Acc.planetId || 1E3 < AGO.Fleet.Get("Cooldown", b, 2)
                            )) {
                                var d = g, e = a.index, f;
                                f = AGO.Jumpgate.Target[e] ? AGO.Token.getClassHover(3, "own") : AGO.Planets.Get("active", "index") === e ? AGO.Token.getClassHighlight(3) + " ago_color_palered" : "ago_color_palered";
                                d = DOM.appendTR(d, f, {
                                        role: "Task",
                                        data: b
                                    }
                                );
                                e = AGO.Option.isAnd("U31", "U32") ? e : "";
                                DOM.appendTD(d, "ago_jumpgate_target_shortkey",
                                    e
                                );
                                DOM.appendTD(d, "", AGO.Planets.Data[b].coords);
                                DOM.appendTD(d, "ago_jumpgate_target_name", AGO.Planets.Data[AGO.Planets.Data[b].planet].name);
                                e = DOM.appendTD(d);
                                DOM.appendSPAN(e, "ago_jumpgate_cooldown");
                                e = DOM.appendTD(d);
                                DOM.appendIMG(e, AGO.Planets.Data[b].img, "16px");
                                DOM.appendTD(d, "ago_jumpgate_target_name", AGO.Planets.Data[b].name);
                                e = DOM.appendTD(d, {
                                        "class": "ago_jumpgate_target_ships ago_color_normal",
                                        "ago-data-change": JSON.stringify({
                                                page: "Panel",
                                                role: "hover"
                                            }
                                        )
                                    }, "-"
                                );
                                e.addEventListener("mouseover",
                                    c, !1
                                );
                                e.addEventListener("mouseout", c, !1)
                            }
                        }
                    ), DOM.prependChild(a.querySelector("#selecttarget"), g), g = DOM.appendTABLE(null, "ago_jumpgate_settings ago_color_normal", {width: "215px"}, [
                            175,
                            25
                        ]
                    ), b(g, "G34"), b(g, "G35"), DOM.after(a.querySelector("#selecttarget > .fright"), g), f(), AGO.Jumpgate.updateCooldown(!0), AGO.Jumpgate.Timer = AGO.Jumpgate.updateCooldown
                ), AGO.Global.message({role: "Jumpgate"}), a.parentNode.parentNode.addEventListener("DOMNodeRemoved", AGO.Jumpgate.Unload, !1), AGO.Jumpgate.Display(), AGO.Global.message({
                        role: "Data",
                        data: {
                            G33: AGO.Option.is("G33"),
                            G34: AGO.Option.is("G34")
                        }
                    }
                ), DOM.addEventsAll("#jumpgate .send_none a", null, {click: AGO.Jumpgate.Display}), DOM.disableActiveElement(), DOM.disableAutocomplete()
            ) : (g = document.querySelector("#jumpgateNotReady #cooldown")
            ) && (a = AGO.Time.parseFormatedTime(g.textContent)
            ) && AGO.Fleet.Set("Cooldown", AGO.Planets.GetId("active"), AGO.Time.timestamp() - Math.ceil(AGO.Ogame.getJumpgateCooldown(AGO.Planets.GetId("active"))) + a)
        }
        a = e = g = e = h = null
    }, updateCooldown: function (a) {
        var b, d, c, f = 0;
        if (a || -4 < AGO.Jumpgate.updateCooldownStatus) {
            a =
                document.querySelectorAll("#ago_jumpgate_target > tr");
            for (d = 0; d < a.length; d++) {
                b = DOM.getAttribute(a[d], null, "ago-data", -2).data, c = AGO.Fleet.Get("Cooldown", AGO.Planets.GetId(b), 2), 1E5 < c && (c = AGO.Ogame.getJumpgateCooldown(AGO.Planets.GetId(b)) - (AGO.Time.timestamp() - c
                    ), 0 <= c && (f++, b = a[d].getElementsByClassName("ago_jumpgate_cooldown")[0], 60 >= c && DOM.updateClass(b, null, "ago_jumpgate_cooldown ago_jumpgate_cooldown_seconds"), c = 60 < c ? Math.ceil(c / 60) : Math.floor(c), DOM.updateText(b, null, Math.floor(c))
                    )
                );
            }
            AGO.Jumpgate.updateCooldownStatus =
                f || AGO.Jumpgate.updateCooldownStatus - 1
        }
    }, Continue: function (a) {
        var b, d, c, f;
        if ((b = document.getElementById("jumpgate")
        ) && a) {
            d = {};
            d[AGO.Planets.GetId(a)] = AGO.Time.timestamp();
            d[AGO.Planets.GetId("active")] = AGO.Time.timestamp();
            AGO.Fleet.Set("Cooldown", d);
            d = {};
            b = b.querySelectorAll(".ship_selection_table td.ship_input_row > input");
            for (c = 0; c < b.length; c++) {
                (f = NMR.parseIntAbs(b[c].id)
                ) && (d[f] = NMR.parseIntAbs(b[c].value)
                );
            }
            a = [
                {planet: AGO.Acc.planetId, tabs: ["Ship"], action: "remove", data: d}, {
                    planet: a, tabs: ["Ship"],
                    action: "add", data: d
                }
            ];
            AGB.message("Units", "Action", {list: a})
        }
    }, setMostShips: function () {
        var a, b, d = {};
        AGO.Units.activeResources(AGO.Jumpgate.Maxi);
        OBJ.iterate(AGO.Jumpgate.Maxi, function (a) {
                d[a] = Math.max(AGO.Jumpgate.Maxi[a] - (+AGO.Jumpgate.Mini[a] || 0
                ), 0
                )
            }
        );
        AGO.Option.is("G35") && (a = Math.ceil(AGO.Jumpgate.Maxi.resources / AGO.Ogame.getShipCapacity("203")), b = Math.max(a - (+AGO.Jumpgate.Maxi["203"] || 0
            ), 0
            ), b = 0 < b ? 5 * b : 0, a > (AGO.Jumpgate.Mini["203"] || 0
            ) && (d["203"] = Math.max(AGO.Jumpgate.Maxi["203"] - a, 0)
            ), b > (AGO.Jumpgate.Mini["202"] || 0
            ) && (d["202"] =
                    Math.max(AGO.Jumpgate.Maxi["202"] - b, 0)
            )
        );
        AGO.Global.message({role: "setMostShips", data: d})
    }, clickTarget: function (a) {
        var b;
        if (a && a.target) {
            if (b = DOM.getAttributeParent(a.target, null, "ago-data", -2, 2), OBJ.copy(DOM.getAttributeParent(a.target, null, "ago-data-change", -2, 1), b), "dblclick" === a.type) {
                AGO.Option.is("U34") && DOM.click("#jumpgate .secondcol input.btn_blue");
            } else if ("Panel" === b.page) {
                if (a = AGO.Planets.Get(b.data, "coordstype", 6)) {
                    AGO.Init.Messages("Panel", "Display", {
                            tab: "Account",
                            data: a
                        }
                    ), AGO.Init.Messages("Panel",
                        "hover", !0
                    )
                }
            } else {
                "Task" === b.role && AGO.Jumpgate.Action(b.data)
            }
        }
    }, Action: function (a) {
        var b;
        (b = document.getElementById("jumpgate")
        ) && a && (a = b.querySelector('select[name="zm"] option[value="' + a + '"]')
        ) && DOM.setValue(a.parentNode, null, a.value, 0, "change")
    }, Display: function () {
        var a, b, d, c;
        if (a = document.getElementById("jumpgate")) {
            if (b = DOM.getSelectedNode(a.querySelector('select[name="zm"]'))) {
                if ((c = AGO.Planets.Get(+b.value, "coords", 6)
                ) || "none" === b.value) {
                    d = a.querySelector("#selecttarget .dropdown > a"), DOM.updateAttribute(d,
                        null, "data-value", b.value
                    ), DOM.updateText(d, null, b.textContent), AGO.Init.Messages("Planets", "Action", {
                            mode: "select",
                            coords: c,
                            type: 3
                        }
                    );
                }
                AGO.Option.is("G31") && (DOM.iterate(a.querySelectorAll("#ago_jumpgate_target tr"), function (a) {
                            DOM.removeClassGroup(a, null, "ago_selected")
                        }
                    ), +b.value && DOM.setClassGroup('#ago_jumpgate_target tr[ago-data*="' + b.value + '"]', a, "ago_selected", AGO.Token.getClassSelected(3, !0))
                )
            }
            DOM.setProperty("#ago_jumpgate_settings_status_G34", a, "checked", AGO.Option.is("G34"));
            DOM.setProperty("#ago_jumpgate_settings_status_G35",
                a, "checked", AGO.Option.is("G35")
            )
        }
        a = d = b = null
    }
};
AGO.Phalanx = {
    Messages: function (a, b) {
        AGO.dummy = a + b
    }, Overlay: function (a) {
        var b;
        a && (b = a.parentNode.querySelector(".ui-dialog-title")
        ) && (AGO.Phalanx.coords = AGO.Task.trimCoords(b.textContent), AGO.Option.is("E21") && !AGO.App.OgameMobile && (b.style.paddingRight = "46px", b = DOM.appendSPAN(b.parentNode, "ago_display_arrow"), b.addEventListener("click", AGO.Phalanx.toggleDisplay, !1), a.parentNode.setAttribute("ago_display_status", AGO.Option.get("E23", 2))
            )
        )
    }, Content: function (a) {
        var b, d, c, f, e, g;
        AGO.Phalanx.Data = {};
        a =
            a ? a.querySelector("#phalanxWrap") : null;
        if (AGO.Option.is("E20") && a && !a.getAttribute("ago-status") && !AGO.App.OgameMobile) {
            a.setAttribute("ago-status", 1);
            b = a.querySelectorAll("div.eventFleet > ul, div.partnerInfo > ul");
            AGO.Option.is("E21") && DOM.addClass(a, null, "ago_phalanx_improve");
            for (g = 0; g < b.length; g++) {
                f = c = 0, e = STR.check(NMR.parseIntAbs(b[g].parentNode.id)), d = NMR.parseIntAbs(b[g].parentNode.getAttribute("data-mission-type")), 2 === d && (f = 1, HTML.hasClass(b[g].parentNode.className, "partnerInfo") && (c = STR.check(NMR.parseIntAbs(b[g].parentNode.className)),
                            f = c === e ? 2 : 3, e = "F" + e
                    )
                ), AGO.Phalanx.Data[e] = {
                    arrival: NMR.parseIntAbs(b[g].parentNode.getAttribute("data-arrival-time")),
                    mission: d,
                    union: c || "",
                    unionType: f || 0,
                    reverse: "true" === b[g].parentNode.getAttribute("data-return-flight")
                }, AGO.Phalanx.parseRow(b[g], AGO.Phalanx.Data[e]), 1 !== AGO.Phalanx.Data[e].unionType && AGO.Phalanx.createDetails(b[g], AGO.Phalanx.Data[e]), b[g].addEventListener("click", AGO.Phalanx.click, !1);
            }
            for (e in AGO.Phalanx.Data) {
                1 === AGO.Phalanx.Data[e].unionType && AGO.Phalanx.createDetails(a.querySelector("div#eventRow-" +
                    e + " > ul"
                    ), AGO.Phalanx.Data[e]
                )
            }
        }
    }, parseRow: function (a, b) {
        var d, c, f;
        for (f = 0; f < a.children.length; f++) {
            if (d = a.children[f], c = a.children[f].className, HTML.hasClass(c, "countDown")) {
                if (c = d.querySelector("span")) {
                    DOM.addClass(c, null, HTML.classMission(b.mission)), DOM.addClass(c, null, "ago_panel_add"), b.fleetType = HTML.hasClass(c.className, "neutral") ? 2 : HTML.hasClass(c.className, "hostile") ? 1 : b.reverse ? 4 : 3, 2 === b.unionType && (c.textContent = AGO.Label.get("E28")
                    )
                }
            } else if (HTML.hasClass(c, "arrivalTime")) {
                c = (d.textContent ||
                    ""
                ).split(" ")[0], d.textContent = AGO.Time.convertLocal(c, "[H]:[i]:[s]");
            } else if (HTML.hasClass(c, "descFleet")) {
                b.descFleet = (d.textContent || ""
                ).trim(), 2 <= b.unionType && (d.textContent = ""
                );
            } else if (HTML.hasClass(c, "missionFleet")) {
                b.missionName = DOM.getText("span", d);
            } else if (HTML.hasClass(c, "originFleet")) {
                if (1 === b.unionType) {
                    d.textContent = b.descFleet;
                } else {
                    if (c = d.querySelector("figure")) {
                        b.typeOrigin = HTML.hasClass(c.className, "moon") ? 3 : HTML.hasClass(c.className, "tf") ? 2 : 1
                    }
                }
            } else if (HTML.hasClass(c, "coordsOrigin")) {
                if (c =
                    d.querySelector("a")) {
                    b.coordsOrigin = AGO.Task.trimCoords(c.textContent), b.owncoordsOrigin = AGO.Planets.owncoords(b.coordsOrigin, b.typeOrigin), b.owncoordsOrigin ? (DOM.addClass(c, null, AGO.Token.getClassSelection(b.typeOrigin)), 3 <= b.owncoordsOrigin && DOM.extendClass(d, null, AGO.Token.getClassHighlight(b.typeOrigin))
                    ) : b.coordsOrigin === AGO.Phalanx.coords && DOM.addClass(c, null, "ago_color_blue")
                }
            } else if (HTML.hasClass(c, "detailsFleet")) {
                if ((c = d.querySelector("span")
                ) && 1 !== b.unionType) {
                    d = b;
                    c = c.title;
                    var e = void 0,
                        g = void 0, h = g = void 0;
                    if (c) {
                        e = c.split("<td>");
                        for (h = 1; h < e.length; h++) {
                            if (g = (e[h].split("</td>", 1)[0] || ""
                            ).replace(/\:/g, "").trim(), g = AGO.Item.getByName(g)) {
                                d[g] = NMR.parseIntAbs(e[h].split(">", 3)[2]), d[g] && 2 <= d.unionType && AGO.Phalanx.Data[d.union] && (AGO.Phalanx.Data[d.union][g] = (AGO.Phalanx.Data[d.union][g] || 0
                                    ) + d[g]
                                );
                            }
                        }
                        "metal" in d ? AGO.Task.updateResources(d) : d.resources = -1;
                        AGO.Task.updateShips(d)
                    }
                }
            } else if (HTML.hasClass(c, "destFleet")) {
                if (c = d.querySelector("figure")) {
                    b.type = HTML.hasClass(c.className, "moon") ?
                        3 : HTML.hasClass(c.className, "tf") ? 2 : 1
                }
            } else {
                HTML.hasClass(c, "destCoords") && (c = d.querySelector("a")
                ) && (b.coords = AGO.Task.trimCoords(c.textContent), b.owncoords = AGO.Planets.owncoords(b.coords, b.type), b.owncoords ? (DOM.addClass(c, null, AGO.Token.getClassSelection(b.type)), 3 <= b.owncoords && DOM.extendClass(d, null, AGO.Token.getClassHighlight(b.type))
                    ) : b.coords === AGO.Phalanx.coords && DOM.addClass(c, null, "ago_color_blue")
                )
            }
        }
    }, createDetails: function (a, b) {
        function d(a, b) {
            function c(a, b, d, e) {
                a = DOM.appendTD(a);
                b && d &&
                (DOM.appendSPAN(a, "ago_phalanx_label", b, e), 0 > d ? DOM.appendTEXT(a, "-----") : DOM.appendTEXT(a, d, 2)
                )
            }

            var d, f, n, l, m;
            n = AGO.Option.is("E22") ? 12 : 11;
            l = {ShipCivil: [], ShipCombat: [], Resource: []};
            d = a.appendChild(document.createElement("table"));
            f = DOM.appendTR(d);
            c(f, "I28", b.shipsCivil || "0", 10);
            c(f, "I29", b.shipsCombat || "0", 10);
            c(f, "I27", b.resources || "0", 10);
            OBJ.iterate(l, function (a) {
                    OBJ.iterate(AGO.Item[a], function (c) {
                            0 < b[c] && l[a].push(c)
                        }
                    )
                }
            );
            for (m = 0; 9 > m; m++) {
                if (l.ShipCivil[m] || l.ShipCombat[m] || l.Resource[m]) {
                    f = DOM.appendTR(d),
                        c(f, l.ShipCivil[m], b[l.ShipCivil[m]], n), c(f, l.ShipCombat[m], b[l.ShipCombat[m]], n), c(f, l.Resource[m], b[l.Resource[m]], n);
                } else {
                    break;
                }
            }
            d = f = null
        }

        var c, f;
        AGO.Option.is("E21") && a && (c = document.createElement("li"), c.className = "ago_phalanx_activity", 1 === b.fleetType ? DOM.appendIMG(c, "/cdn/img/galaxy/activity15.gif") : 2 === b.fleetType && (b.owncoords ? DOM.appendIMG(c, "/cdn/img/galaxy/activity.gif") : b.owncoordsOrigin || 1 === b.unionType || (c.textContent = b.descFleet[0], c.title = b.descFleet, c.className += " tooltip"
                )
            ), DOM.prependChild(a,
                c
            ), c = document.createDocumentFragment(), f = DOM.appendDIV(c, "ago_phalanx_left"), 2 > b.unionType && DOM.appendSPAN(f, HTML.classMission(b.mission), b.missionName), f = DOM.appendDIV(c, "ago_phalanx_fleet"), d(f, b), f = DOM.appendDIV(c, "ago_phalanx_right"), a.parentNode.appendChild(c), c = c = f = null
        )
    }, toggleDisplay: function (a) {
        var b;
        a.target && (a = document.getElementById("phalanxWrap")
        ) && (b = "1" === a.parentNode.parentNode.parentNode.getAttribute("ago_display_status") ? 2 : 1, a.parentNode.parentNode.parentNode.setAttribute("ago_display_status", b), AGO.Option.set("E23",
                b, 2
            )
        )
    }, click: function (a) {
        var b;
        a && a.target && (HTML.hasClass(a.target.parentNode.className, "countDown") || HTML.hasClass(a.target.className, "countDown")
        ) && (a = NMR.parseIntAbs(a.target.id), a = AGO.Phalanx.Data[a]
        ) && (b = {
                action: "set",
                tab: "Target",
                marked: 2,
                token: 81,
                time: a.arrival
            }, b.coords = a.reverse ? a.coordsOrigin + ":" + a.typeOrigin : a.coords + ":" + a.type, AGO.Init.Messages("Token", "Action", b)
        )
    }
};
AGO.Techtree = {
    Messages: function (a, b) {
        AGO.dummy = a + b
    }, Content: function (a) {
        (a = a ? a.querySelector("div.techtree") : null
        ) && !a.hasAttribute("ago-status") && a.setAttribute("ago-status", 1)
    }
};
AGO.Buddies = {
    Messages: function (a, b) {
        AGO.dummy = a + b
    }, Content: function (a) {
        var b, d;
        if ((a = a ? a.querySelector("#buddylist") : null
        ) && DOM.updateAttribute(a, null, "ago-status", 1, 8) && AGO.Option.is("D20")) {
            for (a = a.querySelectorAll("tr"), d = 0; d < a.length; d++) {
                if (b = NMR.parseIntAbs(STR.getParameter("to", DOM.getAttribute('a[href*="page=writemessage"]', a[d], "href")))) {
                    b = {
                        page: "Panel", role: "Action", data: {
                            mode: "set",
                            tab: "Player",
                            token: 81,
                            id: b,
                            coords: AGO.Task.trimCoords(DOM.getText("td:nth-child(6) a", a[d])),
                            name: AGO.Task.valid(DOM.getText("td:nth-child(2) span",
                                a[d]
                                )
                            )
                        }
                    }, DOM.set(a[d], null, null, null, {click: AGO.Buddies.click}), DOM.addClass("td:nth-child(2)", a[d], "ago_action"), DOM.setData("td:nth-child(2)", a[d], b)
                }
            }
        }
    }, click: function (a) {
        a && a.target && a.currentTarget && (a = DOM.getData(a.target, null, 2), AGO.Init.Messages(a.page, a.role, a.data)
        )
    }
};
AGO.Notices = {
    Messages: function (a, b) {
        AGO.dummy = a + b
    }, Content: function (a) {
        (a = a ? a.querySelector("#notizen") : null
        ) && !a.hasAttribute("ago-status") && a.setAttribute("ago-status", 1)
    }
};
AGO.Search = {
    Messages: function (a, b) {
        AGO.dummy = a + b
    }, Content: function (a, b, d, c, f) {
        b = +STR.getParameter("method", f) || 0;
        if ((a = a ? a.querySelector(".searchresults") : null
        ) && DOM.updateAttribute(a, null, "ago-status", 1, 8) && (2 === b || 3 === b
        ) && AGO.Option.is("D20")) {
            for (a = a.querySelectorAll("tr"), c = 0; c < a.length; c++) {
                if (f = NMR.parseIntAbs(STR.getParameter("to", DOM.getAttribute(".action a", a[c], "href")))) {
                    b = AGO.Task.valid(DOM.getText("td.userName", a[c])), d = AGO.Task.trimCoords(DOM.getText("td.position a", a[c])), DOM.set(a[c],
                        null, null, null, {click: AGO.Search.click}
                    ), f = {
                        message: {
                            page: "Token",
                            role: "Action",
                            data: {action: "set", tab: "Player", token: 81, id: f, name: b, coords: d}
                        }
                    }, DOM.addClass("td.userName", a[c], "ago_action"), DOM.setData("td.userName", a[c], f), f = {
                        message: {
                            page: "Token",
                            role: "Action",
                            data: {action: "set", tab: "Target", token: 81, name: b, coords: d}
                        }
                    }, DOM.setData("td.position", a[c], f)
                }
            }
        }
    }, click: function (a) {
        a && a.target && (a = DOM.getData(a.target, null, 2), a.message && AGO.Init.Messages(a.message.page, a.message.role, a.message.data)
        )
    }
};
AGO.ShareReport = {
    Buddies: [],
    isLoaded: 0,
    isDone: 0,
    Overlay: function (content) {
        AGO.ShareReport.getBuddies()
            .then(AGO.ShareReport.getAlliance)
            .then(() => {
                AGO.ShareReport.Display(content);
            });

        DOM.addObserver(content, {childList: true}, function (mutations) {
            mutations.forEach(function (mutation) {
                mutation.addedNodes.length && (AGO.ShareReport.isLoaded = 1, AGO.ShareReport.Display(content));
            });
        });
    },
    Display: function (content) {
        if (AGO.ShareReport.isDone && AGO.ShareReport.isLoaded) {
            AGO.ShareReport.Buddies.forEach(function (buddy) {
                $(content).find("#selectNew").append(
                    $("<option>", {value: buddy, text: buddy})
                );
            })
        }
    },
    getBuddies: async () => {
        let res = await $.post("index.php?page=buddies");
        $(res).find(".player").each(function (i, e) {
            AGO.ShareReport.Buddies.push(e.textContent);
        });
    },
    getAlliance: async () => {
        let res = await $.post("index.php?page=allianceOverview", {ajax: 1});
        $(res).find("table.members tbody tr td:first-child span").each(function (i, e) {
            let buddy = e.textContent.split("(")[0].replace(/\s{2,}/g, "").trim();
            AGO.ShareReport.Buddies.indexOf(buddy) === -1 && AGO.ShareReport.Buddies.push(buddy);
        });
        AGO.ShareReport.isDone = 1;
    }
};

if (-1 < window.navigator.userAgent.indexOf("Firefox")) {
    AGO.isFirefox = true;
    AGO.isPhone = -1 < window.navigator.userAgent.indexOf("Mobile");
    AGO.isTablet = -1 < window.navigator.userAgent.indexOf("Tablet");
    AGO.isMobile = AGO.isPhone || AGO.isTablet;
} else if (-1 < window.navigator.userAgent.indexOf("Chrome")) {
    AGO.isChrome = true;
}

if (-1 < window.navigator.userAgent.indexOf("OPR/"))
    AGO.isOpera = true;

AGO.context = 0;
AGO.Page = {
    Messages: function (a, b) {
        AGO.dummy = a + b
    }
};

let PAGE = {};

const AGB = {
    message: function (page, role, para, response) {
        if (para) {
            para.keyPlayer = AGO.App.keyPlayer;
            if ("function" === typeof response) {
                chrome.runtime.sendMessage("", {page: page, role: role, para: para}, null, response);
            } else {
                chrome.runtime.sendMessage("", {page: page, role: role, para: para});
            }
        }
    },
    // TODO: Find a solution for synchronous requests
    Resource: function (a) {
        var b;
        if (a = STR.check(a)) {
            try {
                return b = new XMLHttpRequest, b.open("GET", chrome.extension.getURL(a), !1), b.overrideMimeType("text/plain"), b.send(null), b.responseText || ""
            } catch (c) {
            }
        }
        return ""
    }, Log: function (a, b) {
        (AGO.App.beta || b) && console.log("AntiGameReborn:  " + a)
    }
};

AGO.Init = {
    status: 0,
    active: false,
    KeydownCache: [],
    timing: Date.now(),
    loop: 0,
    Messages: function (module, role, para) {
        if (AGO.Init.status || "Continue" === role) {
            if (Array.isArray(module)) {
                module = -1 < module.indexOf(AGO.App.Page) ? AGO.App.Page : "";
            }

            if ("Init" === module) {
                if ("Timer" === role)
                    window.setTimeout(AGO.Init.Timer, 0);
                else if ("Content" === role)
                    AGO.Init.Content(para);
                else if ("Ready" === role)
                    AGO.Init.Ready();
                else if ("Tooltip" === role)
                    AGO.Init.Tooltip(para);
            } else if (module && AGO[module] && "function" === typeof AGO[module].Messages) {
                AGO[module].Messages(role, para);
            }
        }
    },
    Start: function () {
        window.console.log('waliwaliwanka');
        AGO.Init.status = 0;
        if (document.location && document.location.href && document.documentElement) {
            AGO.App.Start();

            if (20 < AGO.Notify.problem) {
                document.addEventListener("DOMContentLoaded", AGO.Main.Run, false);
            } else if (AGO.App.mode) {
                AGO.Init.status = 1;
                AGO.Init.active = document.hasFocus();
                AGO.Observer.Start();

                if (AGO.App.reload) {
                    AGO.Observer.Head(function () {
                        AGO.App.Init();
                        AGO.Init.Init();
                    });
                } else {
                    AGO.Option.Start();
                    AGO.Styles.Start();
                    AGO.Option.is("O04") && (document.title = AGO.App.title);
                    AGO.Observer.Head(function () {
                        AGO.App.Init();
                        AGO.Styles.Init();
                    });
                    AGO.Init.Init();
                }
            }
        } else {
            300 > ++AGO.Init.loop && window.setTimeout(AGO.Init.Start, AGO.Init.loop)
        }
    }, Init: function () {
        AGB.message("App", "Start", {
                page: AGO.App.page,
                mode: AGO.App.mode,
                keyCom: AGO.App.keyCom,
                keyUni: AGO.App.keyUni,
                keyPlayer: AGO.App.keyPlayer,
                accountId: AGO.App.playerId,
                abbrCom: AGO.Uni.lang,
                abbrUni: AGO.Uni.abbr,
                urlUni: AGO.Uni.url,
                reload: AGO.App.reload
            }, function (a) {
                AGO.Observer.Head(function () {
                        a && AGO.App.mode && 1 === AGO.Init.status && (AGO.Init.status = 2, AGO.App.reload = AGO.App.reload || a.reload, AGO.App.Page = a.Page, AGO.Background.Data =
                                a.Background || {}, AGO.Label.Init(a.Label), 3 <= AGO.App.mode && a.keyPlayer === AGO.App.keyPlayer && (OBJ.copy(a.App, AGO.App), OBJ.copy(a.Uni, AGO.Uni), AGO.Data.Init(), AGO.Option.Init(a.Option), AGO.Item.Init(a.Item), AGO.Panel.Init(a.Panel), AGO.DataBase.Init(a.DataBase), AGO.Box.Init(a.Box), AGO.Token.Init(a.Token), AGO.Units.Init(a.Units), AGO.Fleet.Init(a.Fleet), AGO.App.reload && AGO.App.Save(), AGO.App.upgradeAvailable = NMR.parseVersion(AGO.App.versionAGO) < NMR.parseVersion(AGO.App.versionUpdate)
                            ), a = null, AGO.Observer.Body(AGO.Init.Read,
                                AGO.isChrome && 3 <= AGO.App.mode
                            )
                        )
                    }
                )
            }, AGO.context
        );
    }, Read: function () {
        2 === AGO.Init.status && (AGO[AGO.App.Page] ? (AGO.Init.status = 4, PAGE = AGO.Page = AGO[AGO.App.Page], AGO.App.Ogame && (AGO.Styles.Load(), AGO.Planets.Read(), AGO.Planets.status && (AGO.App.mode = 5, AGO.App.OgameMain = !0, AGO.Time.Read(), AGO.Units.Read(), AGO.Main.Read(), "function" === typeof PAGE.Read && PAGE.Read()
                    )
                ), AGO.Init.Run()
            ) : 100 > ++AGO.Init.loop && (AGB.Log("Init - Read - waiting for page script - loaded " + AGO.App.Page, !0), window.setTimeout(AGO.Init.Read,
                    AGO.Init.loop
                )
            )
        )
    }, Run: function () {
        4 === AGO.Init.status && (AGO.Init.status = 5, AGO.App.OgameMain && (AGO.Units.Run(), AGO.Planets.Run(), AGO.Time.Run(), AGO.Events.Run(), "function" === typeof PAGE.Run && PAGE.Run(), AGO.Panel.Run(), AGO.Notify.Run(), AGO.Main.Run() /* , AGO.Option.is("O60") && AGO.Chat.Run() */
            ), AGO.Observer.Interactive(AGO.Init.Interactive)
        )
    }, Interactive: function () {
        5 === AGO.Init.status && (AGO.Init.status = 6, AGO.Global.Interactive(), "function" === typeof PAGE.Interactive && PAGE.Interactive(), AGO.App.Ogame ? (AGO.Observer.mutationObject = DOM.addObserver(document.body,
                    {childList: !0}, AGO.Observer.Mutation
                ), AGO.Global.message({role: "Ready"}), AGO.App.OgameMain && (AGO.App.reload && (AGO.Label.Update(), AGO.Units.Update()
                    ), AGB.message("App", "Update", {reload: AGO.App.reload}), AGO.Notify.set("Notify")
                )
            ) : window.setTimeout(AGO.Init.Ready, 20)
        )
    }, Ready: function () {
        6 === AGO.Init.status && (AGO.Init.status = 7, AGO.App.OgameMain && AGO.Events.Ready(), "function" === typeof PAGE.Ready && PAGE.Ready(), AGO.Option.is("U31") && OBJ.iterateArray(AGO.Init.KeydownCache, AGO.Init.onKeydown), AGO.App.Ogame &&
            (DOM.disableActiveElement(), DOM.disableAutocomplete()
            ), window.setTimeout(AGO.Init.Complete, 1)
        )
    }, Complete: function () {
        7 === AGO.Init.status && (!AGO.App.OgameMain || AGO.Units.status ? (AGO.Init.status = 8, "function" === typeof PAGE.Complete && PAGE.Complete(), AGO.App.OgameMain && (AGO.Main.Complete(), AGO.App.beta && DOM.setStyleColor("playerName", "id", AGO.App.reload ? "#FF9600" : "#008000")
                )
            ) : 100 > ++AGO.Init.loop && window.setTimeout(AGO.Init.Complete, AGO.Init.loop)
        )
    }, Refresh: function () {
        7 <= AGO.Init.status && AGO.App.OgameMain &&
        AGB.message("App", "Refresh", {}, function (a) {
                AGO.Init.status && a && (AGO.Background.Data = a.Background || {}, AGO.Option.Init(a.Option), AGO.Fleet.Init(a.Fleet), AGO.Box.Init(a.Box, !0), AGO.Panel.Init(a.Panel, !0)
                )
            }
        )
    }, Content: function (para) {
        let overlay;
        if (5 < AGO.Init.status && para && para.page) {
            let page = para.page;
            let targetPAGE;
            if (targetPAGE = AGO[OBJ.get(AGO.App.Overlay, page)]) {
                if ("function" === typeof targetPAGE.Content) {
                    if (!AGO.Init.activeOverlay) {
                        overlay = document.querySelectorAll("body > .ui-dialog .ui-dialog-content");
                        if (overlay.length) {
                            AGO.Init.activeOverlay = {
                                element: overlay[overlay.length - 1].id,
                                page: DOM.getAttribute(overlay[overlay.length - 1], null, "data-page").toLowerCase()
                            };
                        }
                    }

                    if (AGO.Init.activeOverlay && AGO.Init.activeOverlay.element && page === AGO.Init.activeOverlay.page && (overlay = document.getElementById(AGO.Init.activeOverlay.element)))
                        targetPAGE.Content(overlay, AGO.Init.activeOverlay.element, page, para.url, para.para);
                }
            } else if (targetPAGE = AGO[OBJ.get(AGO.App.Content, page)]) {
                "function" === typeof targetPAGE.Content && targetPAGE.Content(page, para.url, para.para, para.response)
            }
        }
    }, Overlay: function (a, b) {
        var c, d;
        5 < AGO.Init.status && a && (d = DOM.getAttribute(a, null, "data-page").toLowerCase(), AGO.Init.activeOverlay = {
                element: a.id,
                page: d
            },
                d ? (c = OBJ.get(AGO.App.Overlay, d)
                ) && AGO[c] && "function" === typeof AGO[c].Overlay && AGO[c].Overlay(a, a.id, d, b) : "function" === typeof PAGE.Dialog && PAGE.Dialog(a, a.id)
        )
    }, Tooltip: function (a) {
        AGO.Menu && document.getElementById("ago_menu") && "function" === typeof AGO.Menu.Tooltip ? AGO.Menu.Tooltip(a) : "function" === typeof PAGE.Tooltip && PAGE.Tooltip(a)
    }, onKeydown: function (a) {
        var b, c, d, e;
        e = !0;
        AGO.App.Ogame && AGO.Init.activeOverlay && (b = document.querySelectorAll("body > .ui-dialog .ui-dialog-content"), b.length ? (c = b[b.length -
                1], d = DOM.getAttribute(c, null, "data-page").toLowerCase(), AGO.Init.activeOverlay = {
                    element: c.id,
                    page: d
                }
            ) : AGO.Init.activeOverlay = null
        );
        AGO.Init.activeOverlay ? (b = OBJ.get(AGO.App.Overlay, d)
        ) && AGO[b] && "function" === typeof AGO[b].onKeydown && (e = AGO[b].onKeydown(a, c)
        ) : (AGO.Menu && document.getElementById("ago_menu") ? e = AGO.Menu.onKeydown(a) : "function" === typeof PAGE.onKeydown && (e = PAGE.onKeydown(a)
            ), e && AGO.App.OgameMain && (e = AGO.Main.onKeydown(a)
            )
        );
        if (!1 === e && !a.cached) {
            try {
                a.preventDefault()
            } catch (g) {
            }
        }
        return e
    }, onSwipe: function (a,
                          b
    ) {
        if (AGO.Init.touch && a) {
            if (10 > b && "function" === typeof PAGE.onSwipe) {
                PAGE.onSwipe(a, b);
            } else if ("function" === typeof AGO.Main.onSwipe) {
                AGO.Main.onSwipe(a, b)
            }
        }
    }, Select: function () {
        var a, b;
        "getSelection" in window && (a = window.getSelection(), a.rangeCount && (b = a.toString()
            )
        );
        !b && document.activeElement && (a = document.activeElement, "TEXTAREA" === a.tagName || "INPUT" === a.tagName && "text" === a.type
        ) && (b = (a.value || ""
            ).substring(a.selectionStart, a.selectionEnd)
        );
        b && 5 <= b.length && (!AGO.App.OgameMain || 60 > b.length
        ) && (b = AGO.Task.parseTarget(b,
                1
            ), b.coords || b.time
        ) && (AGO.App.OgameMain ? AGO.Option.is("I81") && (b = {
                    action: "set",
                    tab: "Target",
                    token: 81,
                    coords: b.coordstype || b.coords,
                    time: b.time,
                    marked: 1
                }, AGO.Init.Messages("Token", "Action", b)
            ) : (b = STR.check(b.coordstype || b.coords) + "|" + STR.check(b.time), AGB.message("Background", "Set", {
                        key: "Panel_Target",
                        value: b
                    }
                )
            )
        )
    }, Timer: function () {
        5 < AGO.Init.status && AGO.App.OgameMain && (AGO.Time.Display(), AGO.Planets.Timer(), 1 === AGO.Acc.type && AGO.Units.Timer(), PAGE.Timer && PAGE.Timer(), AGO.Jumpgate && AGO.Jumpgate.Timer &&
            AGO.Jumpgate.Timer(), AGO.Main.updateTitle()
        )
    }, Timing: function (a) {
        a ? AGB.Log(a + (Date.now() - AGO.Init.timing - (Date.now() - AGO.Init.timingRange
            )
        ) + "   + " + (Date.now() - AGO.Init.timingRange
        ) + " -- " + document.readyState
        ) : AGO.Init.timingRange = Date.now()
    },
    Location: function (page, delay) {
        window.setTimeout(function () {
            document.location.href = AGO.Uni.path + (page || "overview");
        }, delay || 300);
    }, Valid: function (a, b) {
        var c;
        AGO.Init.status && "function" === typeof a && (c = new XMLHttpRequest, c.open("GET", AGO.Uni.url + "/game/index.php?page=fetchTechs&ajax=1",
                !0
            ), c.overrideMimeType("text/html"), c.onerror = c.onload = function () {
                AGO.Init.status && (200 === +c.status && STR.check(c.responseText)[0] === String.fromCharCode(123) ? a() : "function" === typeof b && b()
                )
            }, c.send(null)
        )
    }, Script: function (a) {
        var b, c;
        if (!AGO.Init.ogameScript) {
            b = DOM.queryAll("#box > script", document.getElementById("boxBG"));
            for (c = 0; c < b.length; c++) {
                if (!b[c].src && -1 < (b[c].innerHTML || ""
                ).indexOf("var session")) {
                    AGO.Init.ogameScript = b[c];
                    break
                }
            }
            AGO.Init.ogameScript = AGO.Init.ogameScript || -1
        }
        b = "";
        return OBJ.is(AGO.Init.ogameScript) &&
        (b = AGO.Init.ogameScript.innerHTML || "", "production" === a
        ) ? (a = b.indexOf("initAjaxResourcebox"), 0 < a && (a = b.indexOf("{", a + 30), c = b.indexOf("function", a), c > a
            ) ? (c = b.lastIndexOf("}", b.lastIndexOf("}", c) - 1), b.slice(a, c + 1) || ""
            ) : ""
        ) : b
    }
};
AGO.Background = {
    Data: {}, Get: function (a, b) {
        var c;
        c = a ? AGO.Background.Data[a] : "";
        return 6 === b ? STR.check(c) : +c || 0
    }, Set: function (a, b) {
        a && (AGO.Background.Data[a] = b, AGB.message("Background", "Set", {key: a, value: b})
        )
    }
};
AGO.Observer = {
    head: [null], 
	body: [null], 
	interactive: [null], 
	mousedown: null, 
	Start: function () {
        var a;
        a = document.onreadystatechange;
        document.onreadystatechange = function () {
            "interactive" === document.readyState && (AGO.Observer.Call(AGO.Observer.body), AGO.Observer.Call(AGO.Observer.interactive)
            );
            try {
                a()
            } catch (b) {
            }
        };
        document.addEventListener("DOMContentLoaded", function c() {
                document.removeEventListener("DOMContentLoaded", c, !1);
                AGO.Observer.Call(AGO.Observer.body);
                AGO.Observer.Call(AGO.Observer.interactive)
            }, !1
        );
        window.addEventListener("blur", function () {
                AGO.Init.active = !1
            }, !1
        );
        window.addEventListener("focus", function () {
                AGO.Init.active || (AGO.Init.active = !0, 7 <= AGO.Init.status && AGO.Init.Refresh()
                )
            }, !1
        );
        window.addEventListener("beforeunload", function () {
                DOM.removeObserver(AGO.Observer.mutationObject);
                AGO.Init.status = 0
            }, !1
        );
        window.addEventListener("keydown", AGO.Observer.onKeydown, !0);
        window.addEventListener("ago_global_send", function (a) {
                a = OBJ.parse(a ? a.detail : "");
                a.page && AGO.Init.Messages(a.page, a.role, a.data)
            },
            !1
        );
        chrome.runtime.onMessage.addListener(function (a) {
                a && a.player === AGO.App.keyPlayer && AGO.Init.Messages(a.page, a.role, a.data)
            }
        );
        document.addEventListener("mousedown", function (a) {
                var d;
                if (AGO.Observer.mousedown) {
                    a = a.target;
                    for (d = 0; 9 > d; d++) {
                        if (a) {
                            if (a.id === AGO.Observer.mousedown.id) {
                                break;
                            } else {
                                a = a.parentNode;
                            }
                        } else {
                            d = 9;
                            break
                        }
                    }
                    9 === d && (a = AGO.Observer.mousedown.action, AGO.Observer.set("mousedown"), "function" === typeof a && a()
                    )
                }
            }, !1
        );
        document.addEventListener("mouseup", function (a) {
                a.keyCode || a.altKey ||
                a.ctrlKey || a.shiftKey || a.metaKey || AGO.Init.Select()
            }, !1
        );
        document.addEventListener("touchstart", function (a) {
                var d, e;
                AGO.Observer.area = 0;
                a && a.target && 1 === a.touches.length && (AGO.Observer.startX = AGO.Observer.pageX = e = a.touches[0].pageX, AGO.Observer.startY = AGO.Observer.pageY = a.touches[0].pageY, d = Math.floor((+document.body.clientWidth || 1
                    ) / 2
                    ), 40 > a.touches[0].screenX || DOM.findParent(a.target, null, "ago_panel", 8) ? AGO.Observer.area = 12 : AGO.Observer.area = e > d - 335 && e < d + 335 ? 950 > window.innerWidth ? 0 : DOM.findParent(a.target,
                        null, "inhalt", 9
                    ) ? 1 : 0 : e > d + 330 && DOM.findParent(a.target, null, "planetList", 9) ? 15 : e < d - 280 && DOM.findParent(a.target, null, "links", 9) ? 11 : 0, AGO.Observer.area && (window.setTimeout(function () {
                                10 > Math.abs(AGO.Observer.startX - AGO.Observer.pageX) && 10 > Math.abs(AGO.Observer.startY - AGO.Observer.pageY) && (AGO.Observer.area = 0
                                )
                            }, 120
                        ), window.clearTimeout(AGO.Observer.touchTimeout), AGO.Observer.touchTimeout = window.setTimeout(function () {
                                AGO.Observer.area = 0
                            }, 1E3
                        )
                    )
                )
            }, !1
        );
        document.addEventListener("touchmove", function (a) {
                var d,
                    e;
                AGO.Observer.area && (AGO.Observer.pageX = a.touches[0].pageX, AGO.Observer.pageY = a.touches[0].pageY, !window.scrollX || 0 < AGO.Observer.startX - AGO.Observer.pageX
                ) && (d = Math.abs(AGO.Observer.startX - AGO.Observer.pageX) + 1, e = Math.abs(AGO.Observer.startY - AGO.Observer.pageY) + 1, (d = 1 === AGO.Observer.area && (3 < d || 3 < e
                        ) && .35 > d / e
                    ) ? AGO.Observer.area = 0 : a.preventDefault()
                )
            }, !1
        );
        document.addEventListener("touchend", AGO.Observer.onSwipe, !1);
        document.addEventListener("touchcancel", AGO.Observer.onSwipe, !1)
    },
    Head: function (a) {
        function b(a) {
            var b;
            OBJ.iterate(a, function (e) {
                    "HTML" === a[e].target.nodeName && a[e].addedNodes.length && "BODY" === a[e].addedNodes[0].nodeName && a[e].addedNodes[0].childNodes.length && (b = true)
                }
            );
            b && AGO.Observer.Call(AGO.Observer.head)
        }

        AGO.Init.status && (document.body || true === AGO.Observer.head[0] ? a() : (AGO.Observer.head[0] || (AGO.Observer.head[0] = DOM.addObserver(document, {
                            childList: !0,
                            subtree: !0
                        }, b
                    )
                ), AGO.Observer.head.push(a)
            )
        )
    }, Body: function (a, b) {
        function c(a) {
            var b, c;
            for (b in a) {
                if (a[b].target && "box" === a[b].target.id && "boxBG" === a[b].target.parentNode.id) {
                    for (var f = 0; f < a[b].addedNodes.length; f++) {
                        "SCRIPT" === a[b].addedNodes[f].nodeName &&
                        document.getElementById("rechts") && (c = !0
                        );
                    }
                }
                if (c) {
                    AGO.Observer.Call(AGO.Observer.body);
                    break
                }
            }
        }

        AGO.Init.status && ("complete" === document.readyState || "interactive" === document.readyState || !0 === AGO.Observer.body[0] ? a() : (b && !AGO.Observer.body[0] && (AGO.Observer.body[0] = DOM.addObserver(document, {
                            childList: !0,
                            subtree: !0
                        }, c
                    )
                ), AGO.Observer.body.push(a)
            )
        )
    }, Interactive: function (a) {
        AGO.Init.status && ("complete" === document.readyState || "interactive" === document.readyState || !0 === AGO.Observer.interactive[0] ? a() : AGO.Observer.interactive.push(a)
        )
    },
    Call: function (a) {
        var b;
        if (AGO.Init.status && a && "object" === typeof a && !0 !== a[0]) {
            b = a[0];
            a[0] = !0;
            b && DOM.removeObserver(b);
            for (b = 1; b < a.length; b++) {
                if ("function" === typeof a[b]) {
                    a[b]();
                }
            }
            a.length = 1
        }
    }, set: function (a, b, c) {
        AGO.Observer[a] = b && c ? {id: b, action: c} : null
    }, onKeydown: function (a) {
        if (!(!a || !a.keyCode || a.altKey || a.ctrlKey && (37 > a.keyCode || 40 < a.keyCode
            )
        ) && AGO.Option.is("U31")) {
            112 <= a.keyCode && 123 >= a.keyCode && AGO.Option.is("U32") && (a.stopPropagation(), a.preventDefault()
            );
            if (7 > AGO.Init.status) {
                return AGO.Init.KeydownCache.push({
                        cached: !0,
                        keyCode: a.keyCode,
                        shiftKey: a.shiftKey,
                        ctrlKey: a.ctrlKey
                    }
                ), !1;
            }
            a.target && (a.inputType = "TEXTAREA" === a.target.nodeName ? 12 : "INPUT" === a.target.nodeName && "text" === a.target.type ? 11 : 0
            );
            return AGO.Init.onKeydown(a)
        }
        return !0
    }, Mutation: function (a) {
        var b, c, d;
        for (c in a) {
            if ("BODY" === a[c].target.nodeName && a[c].addedNodes) {
                for (d = 0; d < a[c].addedNodes.length; d++) {
                    if ("DIV" === a[c].addedNodes[d].nodeName && (b = a[c].addedNodes[d], "dialog" === b.getAttribute("role")
                    )) {
                        AGO.Init.Overlay(b.querySelector(".ui-dialog-content"));
                        return
                    }
                }
            }
        }
    },
    onSwipe: function () {
        var a, b, c, d;
        window.clearTimeout(AGO.Observer.touchTimeout);
        AGO.Init.touch && AGO.Observer.area && (a = AGO.Observer.startY - AGO.Observer.pageY, c = AGO.Observer.startX - AGO.Observer.pageX, d = Math.abs(c || 1) / Math.abs(a || 1), .35 > d ? 1 < AGO.Observer.area && (-100 >= a ? b = "down" : 100 <= a && (b = "up"
                )
            ) : 3 < d ? (a = 10 > AGO.Observer.area ? 80 : 40, c <= -a ? b = "right" : c >= a && (b = "left"
                )
            ) : .6 < d && 1.4 > d && (-70 >= a ? b = "diagDown" : 70 <= a && (b = "diagUp"
                )
            ), AGO.Init.onSwipe(b, AGO.Observer.area)
        )
    }
};
AGO.Global = {
    Interactive: function () {
        AGO.App.Ogame && AGO.Global.message({
                role: "Interactive", data: {
                    commander: AGO.Option.is("commander"),
                    galaxy: AGO.Acc.galaxy,
                    page: AGO.App.page,
                    timeStatus: AGO.Time.status,
                    timeZoneDelta: AGO.Time.timeZoneDelta,
                    galaxies: AGO.Uni.galaxies,
                    donutGalaxy: AGO.Uni.donutGalaxy,
                    U60: AGO.Option.is("U60"),
                    U61: AGO.Option.isAnd("U60", "U61"),
                    U62: AGO.Option.get("U62", 2),
                    U65: AGO.Option.get("U65", 2),
                    U66: AGO.Option.get("U66", 2),
                    U67: AGO.Option.get("U67", 2),
                    B21: AGO.Option.get("B21", 2),
                    G30: AGO.Option.is("G30"),
                    O51: AGO.Planets.improve,
                    O53: AGO.Planets.enabled && AGO.Option.is("O53"),
                    F00: AGO.Option.is("F00"),
                    F02: AGO.Option.get("F02", 2),
                    F19: AGO.Option.get("F19")
                }
            }
        )
    }, message: function (a, b) {
        var c;
        if (a && (window.dispatchEvent(new window.CustomEvent("ago_global", {detail: JSON.stringify(a)})), "getProperty" === a.role || b
        )) {
            c = DOM.getAttribute("ago_global_data", "id", "ago-data-" + (a.property || b
            )
            );
            try {
                return JSON.parse(c)
            } catch (d) {
                return ""
            }
        }
    }
};
AGO.App = {
    page: "",
    Page: "",
    pathSkin: "",
    title: "",
    mode: 0,
    beta: 0,
    versionOGame: "",
    Overlay: {
        jumpgatelayer: "Jumpgate",
        techtree: "Techtree",
        phalanx: "Phalanx",
        showmessage: "Showmessage",
        buddies: "Buddies",
        notices: "Notices",
        search: "Search",
        sharereportoverlay: "ShareReport",
        messages: "Messages"
    },
    Content: {
        resources: "Resources",
        station: "Station",
        traderoverview: "Trader",
        research: "Research",
        shipyard: "Shipyard",
        defense: "Defense",
        galaxycontent: "Galaxy",
        allianceoverview: "Alliance",
        alliancemanagement: "Alliance",
        alliancebroadcast: "Alliance",
        allianceapplications: "Alliance",
        premium: "Premium",
        shop: "Shop",
        eventlist: "Events",
        fetcheventbox: "Fleet",
        minifleet: "Fleet",
        tutorialmission: "Tutorial",
        messages: "Messages",
        highscorecontent: "Highscore"
    },
    Start: function () {
        AGO.App.pathSkin = chrome.extension.getURL("/skin/");
        AGO.App.versionAGO = chrome.runtime.getManifest().version;
        AGO.App.name = STR.check(chrome.runtime.getManifest().name);
        AGO.App.beta = -1 < AGO.App.name.indexOf("Alpha") ? 3 : -1 < AGO.App.name.indexOf("Beta") ? 1 : 0;
        AGO.Uni.domain = document.location.hostname.toLowerCase();
        AGO.Uni.url = document.location.protocol + "//" + AGO.Uni.domain;

        if (document.location.href.match(/https:\/\/.+\.ogame.gameforge.com\/game\/index\.php\?+.*page=*/i)) {
            let page = STR.getParameter("page", document.location.href).toLowerCase();
            AGO.App.page = page === "standalone" ? STR.getParameter("component", document.location.href).toLowerCase() : page;

            // if planet is changed while on fleet2 or fleet3, user lands on fleet1 page even though url shows page=fleet2/3
            if (0 === AGO.App.page.indexOf("fleet") && STR.getParameter("cp", document.location.href))
                AGO.App.page = "fleet1";

            AGO.Uni.path = document.location.href.split("?")[0] + "?page=";

            let domainParts = AGO.Uni.domain.split(".");
            let serverParts = (domainParts[0] || "").split("-");
            AGO.Uni.lang = (serverParts[1] || "EN").toUpperCase();  // DE
            AGO.Uni.number = NMR.parseIntAbs(serverParts[0]);   // 148

            if (AGO.Uni.number) {
                AGO.App.mode = 3;
                AGO.Uni.abbr = "UNI" + AGO.Uni.number;  // UNI148
                AGO.App.keyCom = "AGO_" + AGO.Uni.lang; // AGO_DE
                AGO.App.keyUni = AGO.App.keyCom + "_" + AGO.Uni.abbr;  // AGO_DE_UNI148
                OBJ.copy(OBJ.parse(AGO.Data.getStorage(AGO.App.keyUni + "_App")), AGO.App);

                AGO.App.title = AGO.App.title || AGO.Uni.lang + " " + AGO.Uni.number;

                if (!AGO.App.playerId || STR.getParameter("reloginx", document.location.href.toLowerCase()))
                    AGO.App.login = AGO.App.reload = true;
                else
                    AGO.App.keyPlayer = AGO.App.keyUni + "_" + AGO.App.playerId;
            }

            AGO.App.disabled && AGO.Notify.set("Problem", 21);
            4 !== domainParts.length && AGO.Notify.set("Problem", 31);
        } else {
            // AGO on tools sites
            // TODO: AGO doesn't have permissions on these sites, look through all external sites and filter out outdated ones
            AGO.App.page = -1 < AGO.Uni.domain.indexOf("speedsim.net") ? "websim" : -1 < AGO.Uni.domain.indexOf("osimulate.com") ? "osimulate" : "";

            if (AGO.App.page) {
                AGO.Uni.lang = (STR.getParameter("uni", document.location.href).split("_")[0] || "EN").toUpperCase();
                AGO.App.keyCom = "AGO_" + AGO.Uni.lang;
                AGO.App.mode = 2;
            }
        }
    },
    Init: function () {
        var a, b, c;
        a = document.head.getElementsByTagName("meta");
        for (c = 0; c < a.length; c++) {
            if (a[c].name) {
                switch (b = a[c].getAttribute("content"), a[c].name) {
                    case "ogame-player-name":
                        AGO.Acc.name = b;
                        break;
                    case "ogame-planet-coordinates":
                        AGO.Acc.coords = b;
                        break;
                    case "ogame-planet-type":
                        AGO.Acc.type = "moon" === b ? 3 : 1;
                        break;
                    case "ogame-planet-id":
                        AGO.Acc.planetId = b;
                        break;
                    case "ogame-planet-name":
                        AGO.Acc.planetName = b;
                        break;
                    case "ogame-player-id":
                        AGO.Acc.playerId = b;
                        break;
                    case "ogame-version":
                        AGO.App.versionOGame = b;
                        break;
                    case "ogame-session":
                        AGO.Acc.session = b;
                        break;
                    case "ogame-timestamp":
                        AGO.Acc.timestamp =
                            +b || 0;
                        break;
                    case "AntiGameOrigin":
                        AGO.App.twice = !0
                }
            }
        }
        AGO.App.init = !0;
        AGO.App.mode = AGO.App.twice ? 0 : 2 === AGO.App.mode ? 2 : AGO.Acc.playerId && AGO.Acc.session ? 4 : 3;
        if (4 <= AGO.App.mode) {
            if (!AGO.App.login && AGO.App.playerId && AGO.App.playerId !== AGO.Acc.playerId) {
                AGO.Init.status = AGO.App.mode = 0, AGO.Data.setStorage(AGO.App.keyUni + "_App", "");
            } else {
                AGO.App.Ogame = !0;
                OBJ.copy(AGO.Task.splitCoords(AGO.Acc.coords), AGO.Acc);
                AGO.Acc.coordstype = AGO.Acc.coords + ":" + AGO.Acc.type;
                AGO.App.keyPlayer = AGO.App.keyUni + "_" + AGO.Acc.playerId;
                AGO.App.OgameMobile = !DOM.hasClass(document.body, null, "no-touch");
                if (AGO.App.login || AGO.App.playerId !== AGO.Acc.playerId || AGO.App.session !== AGO.Acc.session) {
                    AGO.App.reload = !0, AGO.App.playerId = AGO.Acc.playerId, AGO.App.Save(), AGB.Log("App - Login:   Com: " + AGO.Uni.lang + "   Uni: " + AGO.Uni.number + "   Player: " + AGO.Acc.playerId + "   Session: " + AGO.Acc.session, !0);
                }
                a = document.createDocumentFragment();
                DOM.append(a, "meta", {
                        content: AGO.App.versionAGO,
                        name: "AntiGameOrigin",
                        id: "ago_global_data",
                        "ago-data-key": AGO.App.keyPlayer
                    }
                );
                DOM.append(a, "script", {type: "text/javascript"}).textContent = AGB.Resource("js/global.js");
                document.head.appendChild(a)
            }
        }
    },
    Save: function (data) {
        OBJ.copy(data, AGO.App);
        AGO.Data.setStorage(AGO.App.keyUni + "_App", {
            disabled: AGO.App.disabled,
            playerId: AGO.Acc.playerId,
            session: AGO.Acc.session,
            title: AGO.Uni.lang + " " + (AGO.Uni.name || AGO.Uni.number || "")
        });
    }
};
AGO.Uni = {
    status: 0,
    path: "",
    url: "",
    domain: "",
    lang: "",
    abbr: "",
    number: 0,
    name: "",
    speed: 1,
    speedFleet: 1,
    galaxies: 50,
    systems: 499,
    positions: 16,
    rapidFire: 1,
    acs: 1,
    defToTF: 0,
    debrisFactor: .3,
    repairFactor: .7,
    newbieProtectionLimit: 0,
    newbieProtectionHigh: 0,
    topScore: 0,
    donutGalaxy: 0,
    donutSystem: 0,
    probeCargo: 0,
    globalDeuteriumSaveFactor: 1,
    cargoHyperspaceTechMultiplier: 2
};
AGO.Acc = {name: "", coords: "", type: 0, playerId: "", planetId: "", session: "", timestamp: 0};
AGO.Data = {
    Init: function () {
        AGO.App.reload && AGO.Data.removeStorage(AGO.App.keyPlayer + "_Fleet_Current")
    }, Remove: function (a) {
        function b(a) {
            OBJ.iterate(window.localStorage, function (b) {
                    b && 0 === b.indexOf(a || "AGO_") && (window.localStorage.removeItem(b), AGB.Log("Delete - localstorage  - " + b, !0)
                    )
                }
            )
        }

        AGB.Log("Delete - ############ - " + a, !0);
        AGB.message("Data", "Remove", {mode: a}, function (c) {
                c && (b("ago" === a ? "AGO_" : AGO.App.keyPlayer), b(AGO.App.keyUni), AGO.Init.Location("", 600)
                )
            }
        )
    },
    setStorage: function (key, data) {
        if (key) {
            try {
                window.localStorage[key] = OBJ.is(data) ? JSON.stringify(data) : data || "";
            } catch (e) {
                AGB.Log("Data - Error set localstorage", true);
            }
        }
    },
    getStorage: function (key, json) {
        if (key) {
            if (json) {
                try {
                    return JSON.parse(window.localStorage[key] || "{}")
                } catch (e) {
                    return {}
                }
            } else {
                return window.localStorage[key] || "";
            }
        }
        return json ? {} : ""
    }, removeStorage: function (a) {
        a && (window.localStorage[a] = ""
        )
    }
};

window.top === window.self && window.AGO.Init.Start();
