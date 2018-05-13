module.exports = function (grunt) {

    grunt.initConfig({
        responsive_images: {
            dev: {
                options: {
                    sizes: [{
                        width: 200,
                        separator: "_"
                    },
                    {
                        width: 400,
                        separator: "_"
                    }]
                },
                files: [{
                    expand: true,
                    src: ['**/*.{jpg,gif,png}'],
                    cwd: 'img/',
                    dest: 'img-export/'
                }],

            }
        }
    });

    grunt.loadNpmTasks('grunt-responsive-images');

    grunt.registerTask('default', ['responsive_images']);
};