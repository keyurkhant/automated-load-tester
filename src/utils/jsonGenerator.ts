import { v4 } from "uuid";

const generateParagraph = () => {
  return {
    uid: generateUid(),
    type: "p",
    children: [
      {
        text: "Frequently data mining is confused with terms like machine learning and data analysis, but these terms are very different and unique. Data mining and machine learning both use patterns and analytics. Data mining looks for patterns already present in data and brings it out for human intervention to make decisions. Data mining gets this information from large datasets, and data analytics is when organizations decide to take this information and dive into it to learn more. Frequently data mining is confused with terms like machine learning and data analysis, but these terms are very different and unique. Data mining and machine learning both use patterns and analytics. Data mining looks for patterns already present in data and brings it out for human intervention to make decisions. Data mining gets this information from large datasets, and data analytics is when organizations decide to take this information and dive into it to learn more. Frequently data mining is confused with terms like machine learning and data analysis, but these terms are very different and unique. Data mining and machine learning both use patterns and analytics. Data mining looks for patterns already present in data and brings it out for human intervention to make decisions. Data mining gets this information from large datasets, and data analytics is when organizations decide to take this information and dive into it to learn more. Frequently data mining is confused with terms like machine learning and data analysis, but these terms are very different and unique. Data mining and machine learning both use patterns and analytics. Data mining looks for patterns already present in data and brings it out for human intervention to make decisions. Data mining gets this information from large datasets, and data analytics is when organizations decide to take this information and dive into it to learn more. Frequently data mining is confused with terms like machine learning and data analysis, but these terms are very different and unique. Data mining and machine learning both use patterns and analytics. Data mining looks for patterns already present in data and brings it out for human intervention to make decisions. Data mining gets this information from large datasets, and data analytics is when organizations decide to take this information and dive into it to learn more. Frequently data mining is confused with terms like machine learning and data analysis, but these terms are very different and unique. Data mining and machine learning both use patterns and analytics. Data mining looks for patterns already present in data and brings it out for human intervention to make decisions. Data mining gets this information from large datasets, and data analytics is when organizations decide to take this information and dive into it to learn more. Frequently data mining is confused with terms like machine learning and data analysis, but these terms are very different and unique. Data mining and machine learning both use patterns and analytics. Data mining looks for patterns already present in data and brings it out for human intervention to make decisions. Data mining gets this information from large datasets, and data analytics is when organizations decide to take this information and dive into it to learn more. Frequently data mining is confused with terms like machine learning and data analysis, but these terms are very different and unique. Data mining and machine learning both use patterns and analytics. Data mining looks for patterns already present in data and brings it out for human intervention to make decisions. Data mining gets this information from large datasets, and data analytics is when organizations decide to take this information and dive into it to learn more. Frequently data mining is confused with terms like machine learning and data analysis, but these terms are very different and unique. Data mining and machine learning both use patterns and analytics. Data mining looks for patterns already present in data and brings it out for human intervention to make decisions. Data mining gets this information from large datasets, and data analytics is when organizations decide to take this information and dive into it to learn more. Frequently data mining is confused with terms like machine learning and data analysis, but these terms are very different and unique. Data mining and machine learning both use patterns and analytics. Data mining looks for patterns already present in data and brings it out for human intervention to make decisions. Data mining gets this information from large datasets, and data analytics is when organizations decide to take this information and dive into it to learn more. Frequently data mining is confused with terms like machine learning and data analysis, but these terms are very different and unique. Data mining and machine learning both use patterns and analytics. Data mining looks for patterns already present in data and brings it out for human intervention to make decisions. Data mining gets this information from large datasets, and data analytics is when organizations decide to take this information and dive into it to learn more. Frequently data mining is confused with terms like machine learning and data analysis, but these terms are very different and unique. Data mining and machine learning both use patterns and analytics. Data mining looks for patterns already present in data and brings it out for human intervention to make decisions. Data mining gets this information from large datasets, and data analytics is when organizations decide to take this information and dive into it to learn more.",
      },
    ],
    attrs: {
      dirty: true,
    },
  };
};

/**
 * Shuffles array in place.
 * @param {Array} a items An array containing the items.
 */
function shuffle(a) {
  var j, x, i;
  for (i = a.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    x = a[i];
    a[i] = a[j];
    a[j] = x;
  }
  return a;
}

const generateUid = () => {
  const uid = [
    v4()
      .slice(0, 11)
      .replace("-", Math.floor(Math.random() * 10)),
    "%{*:1-9223372036854775800}",
    "{{{uid}}}",
  ];
  return shuffle(uid).join("-");
};

export const jsonRteGenerator = (size) => {
  const count = Math.floor(size / 5000);
  let json = {
    uid: generateUid(),
    type: "doc",
    attrs: {
      dirty: true,
    },
    children: [] as any[],
  };
  for (let i = 0; i < count; i++) {
    json.children.push(generateParagraph());
  }
  return json;
};

export const generateEntry = (count, size) => {
  let entry = {
    title:
      "Entry %{*:1-9223372036854775800} {{{uid}}} %{*:1-9223372036854775800}",
  };
  for (let i = 1; i <= count; i++) {
    entry[`json_rte_${i}`] = jsonRteGenerator(size);
  }
  return { entry: entry };
};
