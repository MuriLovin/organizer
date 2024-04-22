import * as fs from "fs";
import * as path from "path";

const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const root = import.meta.dirname;
const logsDir = `${root}/logs`;
let logsCleaned = false;

const log = (message: string) => {
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
  }

  const logsFiles = fs.readdirSync(logsDir).filter((f) => f.startsWith("organizer-"));

  if (logsFiles.length > 3 && !logsCleaned) {
    logsFiles.forEach((file) => {
      fs.rmSync(file);
    });

    logsCleaned = true;
  }

  const currentDate = new Date().toLocaleString().replace(/\//g, "-").replace(/,/g, "");
  const justDate = currentDate.split(" ")[0];
  const justTime = currentDate.split(" ")[1];
  const writable = fs.createWriteStream(`${logsDir}/organizer-${justDate}.log`, { flags: "a" });
  writable.write(`${justTime}: ${message}\n`);
};

const organizer = (file: string) => {
  const basename = path.basename(file, ".md");

  if (basename.startsWith(".")) {
    return;
  }

  if (fs.lstatSync(file).isDirectory()) {
    return fs.readdirSync(file).forEach((f) => {
      organizer(`${file}/${f}`);
    });
  }

  const extension = path.extname(file);
  const month = basename.split("-")[1];
  const year = basename.split("-")[2];
  const monthName = monthNames[parseInt(month) - 1];

  if (extension !== ".md") {
    return;
  }

  log(`Organizando ${file} para ${year}/${monthName}/${basename}${extension}`);

  if (!fs.existsSync(`${root}/${year}/${monthName}`)) {
    fs.mkdirSync(`${root}/${year}/${monthName}`);
  }

  const oldPath = `${root}/${file}`;
  const newPath = `${root}/${year}/${monthName}/${basename}${extension}`;
  if (!fs.existsSync(newPath)) {
    fs.renameSync(oldPath, newPath);
  }
};

fs.readdirSync(root).forEach((file) => {
  organizer(file);
});