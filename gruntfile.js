module.exports = function (grunt) {

  grunt.initConfig({
    responsive_images: {
      dev: {
        options: {
          sizes: [
            {
              name: 'placeholder',
              width: 100,
              quality: 20,
              separator: "_"
            },
            {
              width: 200,
              quality: 80,
              separator: "_"
            },
            {
              width: 400,
              quality: 80,
              separator: "_"
            }
          ]
        },
        files: [{
          expand: true,
          src: ['**/*.{jpg,gif,png}'],
          cwd: 'img-original/',
          dest: 'img-export/'
        }],

      }
    }
  });

  grunt.loadNpmTasks('grunt-responsive-images');

  grunt.registerTask('default', ['responsive_images']);
};
