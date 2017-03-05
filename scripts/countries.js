const ProgressBar = require('progress');
const massive = require('massive');
const connectionString = 'postgres://mikmak:password@localhost/ets';
const db = massive.connectSync({ connectionString: connectionString });

const countries = {
  "Afghanistan": {
    aliases: ["Afganistan"]
  },
  "Antigua and Barbuda": {
    aliases: ["Antigua And Barbuda"]
  },
  "Congo": {
    aliases: ["Democratic republic of the Congo"]
  },
  "Ivory Coast": {
    aliases: ["Cote d'Ivoire", "Cote D'ivoire", "Cote d&#39;Ivoire"]
  },
  "Yemen": {
    aliases: ["Democratic Yemen"]
  },
  "El Salvador": {
    aliases: ["Elsalvador"]
  },
  "Germany": {
    aliases: ["United Germany"]
  },
  "Iran": {
    aliases: ["Iran, Islamic Republic of", "Iran (Islamic Republic Of)", "Iran Islamic Republic of"]
  },
  "South Korea": {
    aliases: ["Korea, Democratic People's Rep. of", "Korea, Democratic People's Rep.", "Korea Dem.People's Rep. Of", "Korea Democratic People&#39;s Rep. of", "Korea  Dem.People&#39;s Rep. Of", "Korea Democratic People's Rep.", "Korea Republic Of", "Korea Republic of",  "Korea, Republic of", "Korea  Republic Of"]
  } ,
  "Laos": {
    aliases: ["Lao", "Lao People's Dem. Republic", "Lao People&#39;s Democratic Republic", "Lao People's Democratic Republi", "Lao People&#39;s Democratic Republic"]
  },
  "Libya": {
    aliases: ["Libyan Arab Jamahiriya", "Lybian Arab Jamahiriya"]
  },
  "Micronesia": {
    aliases: ["Micronesia Federated States of"]
  },
  "Moldova": {
    aliases: ["Republic of Moldova"]
  },
  "Russia": {
    aliases: ["Russian Federation", "Union Of Soviet Socialist Rep."]
  },
  "Saint Helena": {
    aliases: ["St. Helena"]
  },
  "Saint Kitts and Nevis" : {
    aliases: ["Saint Kitts And Nevis"]
  },
  "Saint Vincent and the Grenadines": {
    aliases: ["Saint Vincent And Grenadines"]
  },
  "Saint Pierre Et Miquelon": {
    aliases: ["St. Pierre Et Miquelon"]
  },
  "Syria": {
    aliases: ["Syrian Arab Republic"]
  },
  "Taiwan": {
    aliases: ["Taiwan, Province of China", "Taiwan Province of China"]
  },
  "Tanzania": {
    aliases: ["United Republic of Tanzania"]
  },
  "Macedonia": {
    aliases: ["The former Yugoslav Rep. Macedonia", "The former Yugoslav Rep. Macedo"]
  },
  "Trinidad and Tobago": {
    aliases: ["Trinidad & Tobago"]
  },
  "Turks and Caicos Islands": {
    aliases: ["Turks And Caicos Islands"]
  },
  "United States Virgin Islands": {
    aliases: ["Virgin Islands U.S."]
  },
  "Slovenia": {
    aliases: ["Sloviena"]
  },
  "Ukraine": {
    aliases: ["Ukrain"]
  },
  "United Kingdom": {
    aliases: ["Great Britain"]
  },
  "Guinea-Bissau": {
    aliases: ["Guinea Bissau", "GuineaBissau"]
  },
  "Wallis and Futuna Islands": {
    aliases: ["Wallis And Futuna Islands"]
  },
  "Christmas Island (Australia)": {
    aliases: ["Christmas Island[Australia]"]
  }
}

const COUNTRIES = ["Afghanistan", "Albania", "Algeria", "American Samoa", "Andorra", "Angola", "Anguilla", "Antarctica", "Antigua and Barbuda", "Argentina", "Armenia", "Aruba", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bermuda", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Bouvet Island", "Brazil", "British Indian Ocean Territory", "British Virgin Islands", "Brunei Darussalam", "Bulgaria", "Burkina Faso", "Burma", "Burundi", "Cambodia", "Cameroon", "Canada", "Cape Verde", "Cayman Islands", "Central African Republic", "Chad", "Chile", "China", "Christmas Island (Australia)", "Cocos (Keeling) Islands", "Colombia", "Comoros", "Congo", "Cook Islands", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Czechoslovakia", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "East Timor", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Faeroe Islands", "Falkland Islands (Malvinas)", "Fiji", "Finland", "France", "French Guiana", "French Polynesia", "French Southern Territories", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Gibraltar", "Greece", "Greenland", "Grenada", "Guadeloupe", "Guam", "Guatemala", "Guinea", "Guinea-Bissau", "Haiti", "Heard And Mcdonald Islands", "Holy See (Vatican)", "Honduras", "Hong Kong", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Isle of Man", "Israel", "Italy", "Ivory Coast", "Jamaica", "Japan", "Johnston Island", "Jordan", "Kampuchea Democratic", "Kazakstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Macau", "Macedonia", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Midway Islands", "Moldova", "Monaco", "Mongolia", "Montserrat", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "Netherlands Antilles", "Neutral Zone", "New Caledonia", "New Zealand", "Nicaragua", "Niger", "Nigeria", "Niue", "Norfolk Island", "Northern Mariana Islands", "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Pitcairn", "Poland", "Portugal", "Puerto Rico", "Qatar", "Reunion", "Romania", "Russia", "Rwanda", "Saint Helena", "Saint Kitts and Nevis", "Saint Pierre Et Miquelon", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Serbia and Montenegro", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Svalbard and Jan Mayen Islands", "Swaziland", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Togo", "Tokelau", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Turks and Caicos Islands", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "United States Minor Outlying I", "United States Virgin Islands", "Unknown", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City State (Holy See)", "Venezuela", "Viet Nam", "Wake Island", "Western Sahara", "Yemen", "Yugoslavia", "Zaire", "Zambia", "Zimbabwe"]

let bar = new ProgressBar(':current :percent :bar :eta', {
  total: COUNTRIES.length,
  incomplete: '-',
  complete: '|'
})
COUNTRIES.forEach(country => {
  let aliases = countries[country] 
    ? countries[country].aliases
    : [];
  db.country.insert({
    name: country,
    aliases: aliases
  }, (err, saved) => {
    if (err) { return console.error(`${country} had an error while importing: `, err); }
    bar.tick();
    if (bar.complete) {
      process.exit();
    }
  });
});
