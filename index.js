import { fetchRepoLanguage, fetchRepos, fetchUser } from "./fetch.js";
import { $ } from "./utils.js";

google.charts.load("current", { packages: ["corechart"] });

const USER_NAME = "swon3210";

function getDataTable(object) {
  return Object.entries(object);
}

function convertNullableText(text) {
  if (text === null) {
    return "지정되지 않음";
  }

  return text;
}

function attachUserLink() {
  $(".overview").href = `https://github.com/${USER_NAME}`;
  $(".repositories").href = `https://github.com/${USER_NAME}?tab=repositories`;
  $(".projects").href = `https://github.com/${USER_NAME}?tab=projects`;
}

function renderUserInfo(userInfo) {
  $(".profile img").src = userInfo.avatar_url;
  $(".nickname").innerText = USER_NAME;
  $(".name").innerText = userInfo.name;
  $(".words").innerText = userInfo.bio;
  $(".followers").innerText = userInfo.followers;
  $(".following").innerText = userInfo.following;
  $(".location").innerText = convertNullableText(userInfo.location);
  $(".email").innerText = convertNullableText(userInfo.email);
}

function renderLanguageChart(dataTable) {
  const dataTableHeader = ["언어", "작성된 코드 라인"];

  const data = google.visualization.arrayToDataTable([
    dataTableHeader,
    ...dataTable,
  ]);

  const options = {
    title: "",
    pieHole: 0.4,
  };

  const chart = new google.visualization.PieChart(
    document.querySelector("#language-chart")
  );

  chart.draw(data, options);
}

function renderRepoList(repos) {
  console.log(repos);

  $(".repositories .wrapper").innerHTML = repos
    .map(
      (repo) => `
    <a href=${repo.html_url} class="repository">
      <span class="title">${repo.name}</span>
      <span class="public">${repo.visibility}</span>
    </a>
  `
    )
    .join("");
}

function renderPortfolio() {
  const totalLanguage = {};

  attachUserLink();

  // Render User Info
  fetchUser(USER_NAME).then((userInfo) => {
    renderUserInfo(userInfo);
  });

  // Render Language Chart
  fetchRepos(USER_NAME)
    .then((repos) => {
      renderRepoList(repos);

      return Promise.all(
        repos.map((repo) =>
          fetchRepoLanguage(USER_NAME, repo.name).then((language) => {
            Object.keys(language).forEach((languageName) => {
              if (languageName in totalLanguage) {
                totalLanguage[languageName] += language[languageName];
                return;
              }

              totalLanguage[languageName] = language[languageName];
            });
          })
        )
      );
    })
    .then(() => {
      const languageDataTable = getDataTable(totalLanguage);
      renderLanguageChart(languageDataTable);
    });
}

renderPortfolio();
