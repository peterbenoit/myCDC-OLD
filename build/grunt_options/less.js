'use strict';

module.exports = {
  development: {
    options: {
      paths: ['css'],
      ieCompat: true, //Enforce the css output is compatible with Internet Explorer 8.  (scary)
      compress: false,  //Compress output by removing some whitespaces.
      cleancss: false   //Compress output using clean-css.
    },
    files: [
      {
        expand: true,
        cwd: '<%= pkg.directories.src %>',
        src: '*.less',
        dest: '<%= pkg.directories.dest %>',
        ext: '.css'
      }
    ]
  },
  production: {
    options: {
      paths: ['css'],
      ieCompat: true, //Enforce the css output is compatible with Internet Explorer 8.  (scary)
      compress: true, //Compress output by removing some whitespaces.
      cleancss: true    //Compress output using clean-css.
    }, // idea is that copy task will move these files for production...
    files: [
      {
        expand: true,
        cwd: '<%= pkg.directories.src %>',
        src: '*.less',
        dest: '<%= pkg.directories.dest %>',
        ext: '.css'
      }
    ]
  }
}



