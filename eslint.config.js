// These rules do not require browser or Node global declarations.
export default [
	{
		"ignores": [
			"**/dist/**/*.js"
		]
	},
	{
		"files": [
			"**/*.js"
		],
		"languageOptions": {
			"ecmaVersion": 2020,
			"sourceType": "module",
			"parserOptions": {
				"ecmaFeatures": {
					"impliedStrict": true
				}
			}
		},
		"rules": {
			"semi": 1,
			"no-dupe-args": 1,
			"no-dupe-keys": 1,
			"no-unreachable": 1,
			"valid-typeof": 1,
			"curly": 1,
			"no-useless-call": 1,
			"brace-style": [
				1,
				"stroustrup"
			],
			"no-mixed-spaces-and-tabs": [
				1,
				"smart-tabs"
			],
			"spaced-comment": [
				1,
				"always",
				{
					"block": {
						"exceptions": [
							"*"
						]
					}
				}
			],
			"indent": [
				"error",
				"tab",
				{
					"SwitchCase": 1
				}
			],
			"linebreak-style": 0,
			"arrow-spacing": 1,
			"comma-spacing": 1,
			"keyword-spacing": 1
		}
	}
];
