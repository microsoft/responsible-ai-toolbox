import { IExplanationDashboardData } from "@responsible-ai/interpret";

export const ibmDataInconsistent: IExplanationDashboardData = {
  modelInformation: { modelClass: "blackbox", method: "classifier" },
  dataSummary: {
    classNames: ["stay", "leave"],
    featureNames: [
      "Age",
      "BusinessTravel",
      "DailyRate",
      "Department",
      "DistanceFromHome",
      "Education",
      "EducationField",
      "EnvironmentSatisfaction",
      "Gender",
      "HourlyRate",
      "JobInvolvement",
      "JobLevel",
      "JobRole",
      "JobSatisfaction",
      "MaritalStatus",
      "MonthlyIncome",
      "MonthlyRate",
      "NumCompaniesWorked",
      "OverTime",
      "PercentSalaryHike",
      "PerformanceRating",
      "RelationshipSatisfaction",
      "StockOptionLevel",
      "TotalWorkingYears",
      "TrainingTimesLastYear",
      "WorkLifeBalance",
      "YearsAtCompany",
      "YearsInCurrentRole",
      "YearsSinceLastPromotion",
      "YearsWithCurrManager"
    ]
  },
  precomputedExplanations: {
    globalFeatureImportance: {
      scores: [
        0.013692569020293578,
        0.0036976910726854357,
        0.007850269785440813,
        0.010180702602158673,
        0.01334921962919363,
        0.0009217038873385725,
        0.019451043488070075,
        0.015133276066848993,
        0.0050578156732570805,
        0.0006903945304679025,
        0.01619046596832409,
        0.011081388093708044,
        0.02454152178400457,
        0.022707355872072513,
        0.024308343760719876,
        0.013157821815439587,
        0.0021475456389955004,
        0.019769134040034025,
        0.03399886369589438,
        0.00024565916038094736,
        0.001079885857910857,
        0.015309971247249818,
        0.007875715028338379,
        0.02216934973638687,
        0.011844780032396304,
        0.012620889862383527,
        0.02408852826406089,
        0.020965340106460263,
        0.021146143362974053,
        0.02053564372336309
      ]
    },
    localFeatureImportance: {
      scores: [
        [
          0.005830783536373259,
          0,
          0.001263745823578146,
          0,
          0.0017578836355525143,
          0.0005256144160498324,
          0.005018733753817577,
          -0.010631097955798799,
          0,
          0,
          -0.006370313674054074,
          -0.008399748511389662,
          -0.0008730608808805423,
          0,
          0.0020180773182998327,
          0.012458372458586903,
          0,
          -0.0035105306538529063,
          0,
          0,
          0,
          0,
          0,
          0.012111921300729894,
          -0.003119433550439322,
          0.005359083678153525,
          0.0049235743890687364,
          -0.005002526703398643,
          0.0025863214716397307,
          -0.00519788912448907
        ],
        [
          -0.009025605501864077,
          0,
          -0.004221329912277335,
          0,
          0.003793353517816773,
          0.0016406938649252334,
          -0.017026678141249068,
          0,
          0,
          0,
          -0.01386562958617251,
          -0.006497304250575526,
          0.02057746961998732,
          0.012760581775702183,
          0.015255377286073919,
          0.016921254975068606,
          0.0016513388562378155,
          0,
          -0.0564845170606726,
          0,
          0,
          -0.00739462694808983,
          0,
          -0.002558404017529602,
          0,
          0,
          -0.01139733759803709,
          0.017388942676463397,
          0.005884274492974307,
          0.02013185666926782
        ],
        [
          0.01689581996560327,
          0,
          0.008597980838451896,
          0,
          0.025067010347786564,
          0,
          0.03846983490542055,
          -0.03798339140176718,
          0.02457994655448667,
          0,
          -0.09499280247344566,
          0.019817319137503717,
          -0.0634805320319981,
          0.047237302782052584,
          0.05162857718415022,
          -0.015988923355403833,
          0,
          -0.07058238712631751,
          -0.19970952055553692,
          0,
          0,
          0,
          0,
          0,
          -0.04626160112050942,
          -0.0401287994967153,
          -0.020114808169119258,
          0.05152276049469738,
          0,
          -0.04145257860072091
        ],
        [
          0.0146861933636104,
          0,
          0.004709456617475185,
          0,
          -0.007267821222590409,
          -0.0011311256227309434,
          0.019807586637243822,
          0,
          0,
          -0.0012756629678982653,
          0,
          0.010577534091583188,
          0.011102429396805304,
          0,
          -0.032949918098921886,
          -0.006923437014044763,
          0.0015869777241003837,
          0,
          -0.09609958185788875,
          0,
          0,
          0,
          -0.010867932898160928,
          -0.015042286440246432,
          0.01289843010650358,
          0,
          -0.004871069182945071,
          0.006362120477664927,
          0.00947637365258498,
          -0.00690754054290307
        ],
        [
          -0.004348180368757457,
          0,
          0.002726758300264594,
          -0.011699075834462247,
          -0.010414388413071596,
          0,
          0.0067027387178147275,
          0,
          0,
          0,
          -0.008941411469359766,
          0,
          0.0030383077232107227,
          0,
          0.009097122692793726,
          0.0050162355170441635,
          -0.0016913262400311633,
          0,
          0,
          0,
          0,
          0,
          0.0038082287234732734,
          0,
          0,
          0,
          -0.008615846856557943,
          0.009027616045455015,
          0.0032518937730240116,
          0.0024137727388947035
        ],
        [
          0.001321234766785341,
          0.04976527336698194,
          0.008983023880172348,
          0,
          0.003949332248134426,
          0.0009432342918511451,
          -0.026464602608774663,
          0,
          0,
          0,
          0.022761141172709783,
          0.008681641502894528,
          -0.027220984061941525,
          0,
          -0.02885503827619111,
          -0.004827166479417333,
          -0.003699614364424229,
          0.010902768699473878,
          0,
          0,
          0,
          -0.022796604398089407,
          -0.009243414079127505,
          -0.009871083451266804,
          -0.010530707777134447,
          -0.03570343218236319,
          -0.004512560750863776,
          0.011812118093214679,
          0,
          0
        ],
        [
          0.04108140014756523,
          0,
          0.024491858889938836,
          -0.07528919659024949,
          0.028043351991473384,
          0,
          0.04204507016369763,
          0.04228797019707248,
          0.024632443709641877,
          0,
          -0.054620965846816805,
          0.023383701651131725,
          -0.0899647126398086,
          0.05373102560116866,
          -0.07168881440832209,
          -0.013238916395125117,
          0,
          0,
          -0.2203415567973242,
          0,
          0,
          -0.056542660379329285,
          -0.022457998004976137,
          -0.06062164894126504,
          0,
          -0.046600057927028815,
          0.0212661957526194,
          -0.015099681104809165,
          0,
          -0.014004179826464541
        ],
        [
          -0.0016080170605235894,
          0,
          0.002493396819024097,
          0,
          0.012746598387083034,
          0,
          0.01672426382735643,
          0.0168150514469859,
          0,
          0,
          -0.020436192343304432,
          0.008721199521919801,
          -0.02558404755555549,
          0,
          0.006944060470250313,
          -0.008406012400220993,
          0,
          -0.04597460210764763,
          0,
          0,
          0,
          -0.010800917812866594,
          0,
          0,
          -0.01026142007521405,
          0,
          -0.012286194603951785,
          -0.01563525749683467,
          0,
          0.024800118233181692
        ],
        [
          -0.02120390376432974,
          0,
          0.0074510199370651405,
          0,
          0.00873279404959993,
          0.0025029352217967003,
          -0.03190549707855471,
          0.0217780340318421,
          0,
          0.0017641095945939468,
          0,
          0.010550716236043218,
          -0.03414126661802658,
          0.02704239176569227,
          0.010427626412180847,
          -0.0041403113386272485,
          0.005457380661504394,
          0,
          -0.1073420976464651,
          -0.0008140338616541357,
          0,
          -0.014013177108313964,
          0,
          -0.01244935148423306,
          0,
          0.023729819103504274,
          -0.010257147444198554,
          0.028956948546040726,
          -0.03797505265577354,
          0.023650701573108578
        ],
        [
          0.007720979941620977,
          0.024188548086726776,
          0.006134931934288037,
          0,
          0.005951875213734815,
          0,
          0.01024494388077566,
          0,
          0,
          0.000985648432463676,
          -0.0098022508352264,
          -0.005126211194895465,
          0.011047195738402637,
          0,
          0.0032168421529868724,
          0.009471612917782472,
          0.0017439456620796838,
          -0.011156914757508931,
          0,
          -0.0016295844483695183,
          0.0035705925517249574,
          0.006397705021252044,
          0,
          0.02754276653451186,
          0,
          -0.009283085512312696,
          -0.04503829401454472,
          0.03285248148613095,
          -0.061752945199761655,
          0.002467285778698462
        ],
        [
          -0.03823256851836377,
          0,
          0.008440706992410035,
          0,
          0.013082309139654948,
          0.0020794449686529007,
          0.02756587546196279,
          -0.025441513757048353,
          0.015601168416940349,
          0,
          0,
          0.013813198521296588,
          -0.041394717387900876,
          -0.03102878878426031,
          -0.0445529584913637,
          -0.017282304830180527,
          0,
          0,
          0,
          0,
          0,
          0.018817499489929446,
          -0.015002077538477557,
          -0.045106764853800274,
          0,
          0,
          0.02671959971768431,
          -0.025076603696766564,
          0.012005172155573077,
          -0.027130222280715988
        ],
        [
          -0.001612540743672433,
          0,
          -0.0006747171282733564,
          0,
          0.0009891702997160898,
          0,
          0.0025712858526515435,
          -0.004177642482492664,
          0.0024219223840916968,
          0.00036749652115050657,
          0.004929029645577525,
          0.0019860105170759913,
          0.002190384860841447,
          0.004603736932632533,
          0.001770046243910417,
          -0.001290555400953337,
          -0.00047980603916553816,
          -0.005202422993074775,
          0,
          0,
          0,
          0.0026394410542522227,
          0.002283498567734718,
          -0.0033680502850016274,
          0,
          0,
          0.0019990329220123037,
          -0.001271388213922385,
          0.0018577817652656644,
          -0.0014671754693610928
        ],
        [
          0.0020018808840584637,
          0,
          -0.00059941905412996,
          0,
          0.0033087390830301897,
          0,
          0.004233602326814009,
          0.004366917429060299,
          0,
          0,
          0,
          0.002236585535147034,
          0.0024154021115979337,
          0.005197380273184715,
          0.0019475733835542406,
          -0.0018749505027292053,
          -0.0008107818905411781,
          -0.005671869852340805,
          0,
          0,
          0.0020753169573012858,
          -0.006194184196294643,
          0,
          0.0017403327530227186,
          0,
          0,
          0,
          0,
          0,
          -0.004963811514427071
        ],
        [
          -0.0052698563789381975,
          0,
          0.0024836683888774607,
          0,
          0.008537584484175423,
          -0.001577275855681389,
          0.014488332899624118,
          -0.026942678823071955,
          0.007658675538600354,
          0,
          0.019216408748450847,
          0,
          0.008735288367766497,
          0.01837366895978896,
          -0.02358640083099181,
          0.001292927174873849,
          0.0009533763726017105,
          -0.04790036907770837,
          0,
          0,
          0,
          0,
          -0.00823476154365485,
          0,
          -0.024310395928306826,
          -0.015653828716662013,
          -0.007517572011866855,
          0.01799294831395024,
          0.006154762908228014,
          0.021907991463869656
        ],
        [
          -0.059682031627382726,
          0,
          0.0201984755854365,
          0,
          -0.016285765323340168,
          0,
          0.042245256142344534,
          0,
          0.02626215686138067,
          0.0031767960180445476,
          -0.055563528312016414,
          0.02281925230080209,
          -0.07161429473309919,
          -0.10257562793187047,
          -0.07523830764397765,
          -0.029358901358515765,
          -0.0033784745682006734,
          0,
          0,
          0,
          0,
          -0.058933349064710316,
          -0.024371707377679547,
          -0.07825497632107578,
          0.08006654835567222,
          -0.04725518975039952,
          0.04434357548627499,
          -0.04189264780194857,
          0,
          -0.046366953297695634
        ],
        [
          0.002221924389911728,
          0,
          -0.009999531230865222,
          0,
          -0.03748433474841703,
          0,
          0.0269102562725329,
          -0.026005407223868487,
          0,
          0,
          0,
          0.014420877399457202,
          0.015501180110326779,
          -0.03079464300766732,
          0.0118875814113365,
          -0.009486522705251577,
          0.002216442138991623,
          -0.04603141213974485,
          0,
          -0.0019903666140897724,
          0.013868640126821763,
          -0.03427461649333767,
          -0.014029433923781434,
          -0.01069522448648827,
          -0.030416532140868632,
          0,
          0.028211818916045017,
          -0.025712317028794673,
          0.013025471347785325,
          -0.028204285412279845
        ],
        [
          -0.014103519356891747,
          0,
          0.013626238528672091,
          -0.04372083799412434,
          -0.030002631689585946,
          0.0026888705310797595,
          0.026898139241758462,
          0.027603135522244998,
          0,
          -0.002279857846388733,
          0,
          0,
          0.013196871419914769,
          0,
          0.012256193430049966,
          0.001908195837189569,
          0.007909451073678159,
          -0.09974455867579858,
          0,
          0,
          0,
          0,
          0.014912061570248228,
          -0.03159343697208443,
          -0.01645057702026187,
          -0.02870450088053121,
          0.021027206882369573,
          -0.016994720942045377,
          -0.012678991400729353,
          -0.00987958732183479
        ],
        [
          0.011690874835276255,
          0,
          -0.024709619789283155,
          -0.07290494162433744,
          -0.04493573223208419,
          -0.00534488297400354,
          -0.017996783757899426,
          -0.04506049057537989,
          0,
          0,
          0,
          -0.04630993424847474,
          0.021729719527988745,
          -0.10663111605412456,
          -0.07676528214595812,
          0.07183983994178386,
          -0.010766307657750745,
          0.02469683798429398,
          0,
          0,
          0,
          -0.05763900616025036,
          -0.024898003373034827,
          0.09521533804637078,
          0,
          0,
          -0.16364778724621576,
          0.07229810265776496,
          -0.20115493617129718,
          0.10798744430529555
        ],
        [
          0.005804062849737678,
          0,
          -0.001444164831241396,
          0,
          -0.001127030681293769,
          0,
          0.0041265106394204765,
          0.004293360413366103,
          0,
          0,
          0,
          0.002247438409011435,
          -0.007571344868937029,
          0.005161830833021153,
          0.00181371673828345,
          -0.0024087629343778156,
          -0.0006056895306027288,
          -0.005553284410978166,
          0,
          -0.00047919828350552864,
          0.002083167522369162,
          -0.0029510947780451305,
          0.002400700911037267,
          0,
          0.0025799545730156494,
          0,
          0.0010703244262898507,
          -0.0014016656301668656,
          0.0019710570342200895,
          0
        ],
        [
          0.009510002404605289,
          0,
          0.0037553512270914503,
          0,
          -0.0035066858757313675,
          0,
          0.007574877451688425,
          0.009278830076980705,
          0,
          -0.003958319228818371,
          -0.012309645259347558,
          -0.016039088844958995,
          0.019451226025101312,
          -0.009009022740284573,
          0.004267360594800901,
          0.02902123277161503,
          0,
          -0.01845472232194013,
          0,
          0,
          0,
          0.006804542040235432,
          -0.005004482055381361,
          0.037215408840110875,
          0,
          0,
          -0.04395061891055283,
          0.023005954719136017,
          -0.05314783323062424,
          0.02177948031405347
        ]
      ]
    }
  },
  testData: [
    [
      49,
      "Travel_Rarely",
      1098,
      "Research & Development",
      4,
      2,
      "Medical",
      1,
      "Male",
      85,
      2,
      5,
      "Manager",
      3,
      "Married",
      18711,
      12124,
      2,
      "No",
      13,
      3,
      3,
      1,
      23,
      2,
      4,
      1,
      0,
      0,
      0
    ],
    [
      27,
      "Travel_Rarely",
      269,
      "Research & Development",
      5,
      1,
      "Technical Degree",
      3,
      "Male",
      42,
      2,
      3,
      "Research Director",
      4,
      "Divorced",
      12808,
      8842,
      1,
      "Yes",
      16,
      3,
      2,
      1,
      9,
      3,
      3,
      9,
      8,
      0,
      8
    ],
    [
      41,
      "Travel_Rarely",
      1085,
      "Research & Development",
      2,
      4,
      "Life Sciences",
      2,
      "Female",
      57,
      1,
      1,
      "Laboratory Technician",
      4,
      "Divorced",
      2778,
      17725,
      4,
      "Yes",
      13,
      3,
      3,
      1,
      10,
      1,
      2,
      7,
      7,
      1,
      0
    ],
    [
      44,
      "Travel_Rarely",
      1097,
      "Research & Development",
      10,
      4,
      "Life Sciences",
      3,
      "Male",
      96,
      3,
      1,
      "Research Scientist",
      3,
      "Single",
      2936,
      10826,
      1,
      "Yes",
      11,
      3,
      3,
      0,
      6,
      4,
      3,
      6,
      4,
      0,
      2
    ],
    [
      29,
      "Travel_Rarely",
      1246,
      "Sales",
      19,
      3,
      "Life Sciences",
      3,
      "Male",
      77,
      2,
      2,
      "Sales Executive",
      3,
      "Divorced",
      8620,
      23757,
      1,
      "No",
      14,
      3,
      3,
      2,
      10,
      3,
      3,
      10,
      7,
      0,
      4
    ],
    [
      37,
      "Non-Travel",
      1413,
      "Research & Development",
      5,
      2,
      "Technical Degree",
      3,
      "Male",
      84,
      4,
      1,
      "Laboratory Technician",
      3,
      "Single",
      3500,
      25470,
      0,
      "No",
      14,
      3,
      1,
      0,
      7,
      2,
      1,
      6,
      5,
      1,
      3
    ],
    [
      47,
      "Travel_Rarely",
      1454,
      "Sales",
      2,
      4,
      "Life Sciences",
      4,
      "Female",
      65,
      2,
      1,
      "Sales Representative",
      4,
      "Single",
      3294,
      13137,
      1,
      "Yes",
      18,
      3,
      1,
      0,
      3,
      3,
      2,
      3,
      2,
      1,
      2
    ],
    [
      35,
      "Travel_Rarely",
      982,
      "Research & Development",
      1,
      4,
      "Medical",
      4,
      "Male",
      58,
      2,
      1,
      "Laboratory Technician",
      3,
      "Married",
      2258,
      16340,
      6,
      "No",
      12,
      3,
      2,
      1,
      10,
      2,
      3,
      8,
      0,
      1,
      7
    ],
    [
      25,
      "Travel_Rarely",
      1219,
      "Research & Development",
      4,
      1,
      "Technical Degree",
      4,
      "Male",
      32,
      3,
      1,
      "Laboratory Technician",
      4,
      "Married",
      3691,
      4605,
      1,
      "Yes",
      15,
      3,
      2,
      1,
      7,
      3,
      4,
      7,
      7,
      5,
      6
    ],
    [
      45,
      "Non-Travel",
      1238,
      "Research & Development",
      1,
      1,
      "Life Sciences",
      3,
      "Male",
      74,
      2,
      3,
      "Healthcare Representative",
      3,
      "Married",
      10748,
      3395,
      3,
      "No",
      23,
      4,
      4,
      1,
      25,
      3,
      2,
      23,
      15,
      14,
      4
    ],
    [
      19,
      "Travel_Rarely",
      1181,
      "Research & Development",
      3,
      1,
      "Medical",
      2,
      "Female",
      79,
      3,
      1,
      "Laboratory Technician",
      2,
      "Single",
      1483,
      16102,
      1,
      "No",
      14,
      3,
      4,
      0,
      1,
      3,
      3,
      1,
      0,
      0,
      0
    ],
    [
      32,
      "Travel_Rarely",
      634,
      "Research & Development",
      5,
      4,
      "Other",
      2,
      "Female",
      35,
      4,
      1,
      "Research Scientist",
      4,
      "Married",
      3312,
      18783,
      3,
      "No",
      17,
      3,
      4,
      2,
      6,
      3,
      3,
      3,
      2,
      0,
      2
    ],
    [
      41,
      "Travel_Rarely",
      642,
      "Research & Development",
      1,
      3,
      "Life Sciences",
      4,
      "Male",
      76,
      3,
      1,
      "Research Scientist",
      4,
      "Married",
      2782,
      21412,
      3,
      "No",
      22,
      4,
      1,
      1,
      12,
      3,
      3,
      5,
      3,
      1,
      0
    ],
    [
      32,
      "Travel_Rarely",
      1018,
      "Research & Development",
      2,
      4,
      "Medical",
      1,
      "Female",
      74,
      4,
      2,
      "Research Scientist",
      4,
      "Single",
      5055,
      10557,
      7,
      "No",
      16,
      3,
      3,
      0,
      10,
      0,
      2,
      7,
      7,
      0,
      7
    ],
    [
      21,
      "Travel_Rarely",
      1334,
      "Research & Development",
      10,
      3,
      "Life Sciences",
      3,
      "Female",
      36,
      2,
      1,
      "Laboratory Technician",
      1,
      "Single",
      1416,
      17258,
      1,
      "No",
      13,
      3,
      1,
      0,
      1,
      6,
      2,
      1,
      0,
      1,
      0
    ],
    [
      37,
      "Travel_Rarely",
      408,
      "Research & Development",
      19,
      2,
      "Life Sciences",
      2,
      "Male",
      73,
      3,
      1,
      "Research Scientist",
      2,
      "Married",
      3022,
      10227,
      4,
      "No",
      21,
      4,
      1,
      0,
      8,
      1,
      3,
      1,
      0,
      0,
      0
    ],
    [
      30,
      "Travel_Rarely",
      1358,
      "Sales",
      16,
      1,
      "Life Sciences",
      4,
      "Male",
      96,
      3,
      2,
      "Sales Executive",
      3,
      "Married",
      5301,
      2939,
      8,
      "No",
      15,
      3,
      3,
      2,
      4,
      2,
      2,
      2,
      1,
      2,
      2
    ],
    [
      39,
      "Travel_Rarely",
      119,
      "Sales",
      15,
      4,
      "Marketing",
      2,
      "Male",
      77,
      3,
      4,
      "Sales Executive",
      1,
      "Single",
      13341,
      25098,
      0,
      "No",
      12,
      3,
      1,
      0,
      21,
      3,
      3,
      20,
      8,
      11,
      10
    ],
    [
      51,
      "Travel_Rarely",
      432,
      "Research & Development",
      9,
      4,
      "Life Sciences",
      4,
      "Male",
      96,
      3,
      1,
      "Laboratory Technician",
      4,
      "Married",
      2075,
      18725,
      3,
      "No",
      23,
      4,
      2,
      2,
      10,
      4,
      3,
      4,
      2,
      0,
      3
    ],
    [
      48,
      "Travel_Rarely",
      1224,
      "Research & Development",
      10,
      3,
      "Life Sciences",
      4,
      "Male",
      91,
      2,
      5,
      "Research Director",
      2,
      "Married",
      19665,
      13583,
      4,
      "No",
      12,
      3,
      4,
      0,
      29,
      3,
      3,
      22,
      10,
      12,
      9
    ]
  ],
  predictedY: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
  trueY: [0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
  probabilityY: [
    [0.9942505828841428, 0.005749417115857152],
    [0.9710347828746456, 0.02896521712535441],
    [0.6366222800352146, 0.3633777199647854],
    [0.8913717983758371, 0.10862820162416292],
    [0.9828735172063306, 0.017126482793669327],
    [0.91889563174922, 0.08110436825078006],
    [0.5439937013993861, 0.456006298600614],
    [0.9217530994062779, 0.07824690059372212],
    [0.8813037102893914, 0.11869628971060861],
    [0.9932491415271564, 0.006750858472843607],
    [0.8113775268818223, 0.18862247311817767],
    [0.9945656109675913, 0.00543438903240863],
    [0.9929097858829039, 0.00709021411709612],
    [0.9503035666105207, 0.04969643338947924],
    [0.511841377794639, 0.488158622205361],
    [0.8066406371143501, 0.1933593628856499],
    [0.8193742160935251, 0.1806257839064749],
    [0.49019440544527604, 0.509805594554724],
    [0.9935109605572198, 0.006489039442780259],
    [0.9897849201543754, 0.010215079845624673]
  ]
};
