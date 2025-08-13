FROM ruby:3.1
RUN gem install jekyll bundler
WORKDIR /srv/jekyll
EXPOSE 4000
