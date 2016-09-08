// Include the task that the gulp taskrunner will use
'use strict';

let gulp = require('gulp'),
	sass = require('gulp-sass'),
	nano = require('gulp-cssnano'),
	rename = require('gulp-rename'),
	livereload = require('gulp-livereload'),
	typescript = require('gulp-typescript'),
	spawn = require('child_process').spawn,
	jspm = require('gulp-jspm-build'),
	node = undefined;
// Specify the paths for each of the tasks
let PATHS = {
	js: ['public/**/*.js', '!public/bundle.js', '!public/lib/**/*.js', '!public/jspm_packages/**/*.js'],
	ts: ['public/**/*.ts', '!node_modules/**/*.ts'],
	sass: 'public/sass/**/*.scss',
    styles: 'public/**/*.scss',
	html: ['public/**/*.html', '!public/lib/**/*.html']
};
/**
 * $ gulp sass
 * Define the sass task for compiling sass files to css files
 */

gulp.task('sass', ()=> {
	return gulp.src(PATHS.sass)
		.pipe(sass(
			{
				outputStyle: ':compressed'
			}).on('error', sass.logError)
		)
		.pipe(rename({suffix: '.min'}))
		.pipe(nano())
		.pipe(gulp.dest('./public/css/'))
		.pipe(livereload({port:35729}))
});

/**
 * $ gulp ts2js
 * Define the typescript task for compule typescript files to javascript files
 */
gulp.task('ts2js', () => {
	let tsProject = typescript.createProject('public/tsconfig.json');
	let tsResult = gulp.src(PATHS.ts)
		.pipe(typescript(tsProject));

	return tsResult.js.pipe(gulp.dest('./public'));
});

// gulp.task('bundle',['ts2js'], () => {
// 	let bundle = jspm({
// 			bundleOptions: {
// 				minify: false
// 			},
// 			bundles: [
// 				{ src: './public/app/main.ts', dst: 'build.js' }
// 			],
// 			bundleSfx:true
// 		})
// 		.pipe(gulp.dest('./public/'))
// 		.pipe(livereload());
// 	return bundle;
// });
/**
 * $ gulp html
 * Define the gulp task views to reload the browser when the views are changed
 */
gulp.task('html', () => {
	gulp.src(PATHS.html)
		.pipe(livereload());
});

/**
 * $ gulp watch
 * Define the watch task to restart the server instance when a file in in one of the paths have changed
 */
gulp.task('watch', () => {
	livereload.listen();
	gulp.watch(PATHS.ts, ['ts2js']);
	gulp.watch(PATHS.sass, ['sass']);
	gulp.watch(PATHS.html, ['html']);
	gulp.watch(['./server.js','api/**/*.js', 'config/**/*.js'], ['server']);
});

/**
 * $ gulp server
 * description: launch the server. If there's a server already running, kill it.
 */
gulp.task('server', function () {
	if (node){
		node.kill();
	}
	node = spawn('node', ['server.js'], {stdio: 'inherit'});
	node.on('close', function (code) {
		if (code === 8) {
			gulp.log('Error detected, waiting for changes...');
		}
	});
});


/**
 * $ gulp
 * Define the default sass task
 */
gulp.task('default', ['server', 'html', 'sass', 'ts2js', 'watch'], () => {
	console.log('Online!');
});
// clean up if an error goes unhandled.
process.on('exit', function () {
	if (node) node.kill();
});