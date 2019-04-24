import random
import json
import tempfile
import subprocess
import os.path as osp
import uuid
import os

# js_template = '/Users/vikashanand/Capstone/visualizations/visualization/js/template/sem_dict.html'
# html_template = '/Users/vikashanand/Capstone/visualizations/visualization/js/html/sem_dict.js'
# sem_dict_html = '/Users/vikashanand/Capstone/visualizations/visualization/viz/sem_dict.html'

viz_dict = {
    'neuron_groups': ['svelte_template/neuron_groups.html', 'svelte_compiled/neuron_groups.js', '../../public/neuron_group.html'],
    'spatial_attr':['svelte_template/spatial_attr.html', 'svelte_compiled/spatial_attr.js', '../../public/spatial_attr.html']
}

svelte_path = '/usr/local/Cellar/node/8.5.0/bin/svelte'
svelte_path1 = 'svelte'

_template = """
  <div id='$id'></div>
  <script>
  $js
    var app = new $name({
        target: document.body,
        data: $data,
      });
  </script>
 """

def build_svelte(template, js_file):
  cmd = "/usr/local/bin/svelte compile --format iife " + template + " > " + js_file
  print(cmd)
  print(os.getcwd())
  try:
    print(subprocess.check_output(cmd, shell=True, stderr=subprocess.STDOUT))
  except subprocess.CalledProcessError as exception:
    print("Svelte build failed! Output:\n{}".format(exception.output.decode()))
  return True


def get_js_text(js_file):
    with open(js_file) as f:
        js_text = f.read()
    return js_text


def write_html_file(html_data, filename):
    with open(filename, 'w') as h_file:
        h_file.write(html_data)


def generate_html(viz_type, data):
    files = viz_dict[viz_type]
    build_svelte(files[0], files[1])
    js_text = get_js_text(files[1])
    html_file = _template.replace("$js", js_text).replace("$data", json.dumps(data)).replace("$name", viz_type)
    write_html_file(html_file, files[2])
