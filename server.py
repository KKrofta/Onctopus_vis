#!/usr/bin/env python

from BaseHTTPServer import BaseHTTPRequestHandler, HTTPServer
from SimpleHTTPServer import SimpleHTTPRequestHandler
import SocketServer
import onctopus_python_files.model as model
import urllib
import ast

Port = 8000

#creates a Request Handler for the Server. This is basicly a SimpleHTTPRequestHandler but with an added do_Post function to handle "POST" requests sent by the client.
class H(SimpleHTTPRequestHandler):

	def do_POST(self):
		f = self.send_head()
		content_length = int(self.headers['Content-Length'])
		post_data = self.rfile.read(content_length)
		data = toDictionary(urllib.unquote(post_data).decode('utf8'))
		if data["fct"] == "activate_relation":
			mat = ast.literal_eval(data["mat"])
			rel = ast.literal_eval(data["relations"])
			if rel != [[]]:
				for relation in rel:
					if (not model.activate_ancestor_descendant_relation_without_mutations(mat,int(relation[0]),int(relation[1]))==True):
						#self.wfile.write("ERROR!") #TODO
						print("nothing")
					#print(mat)
			self.wfile.write(mat)

def toDictionary(string):
	dic = {}
	key = ""
	value = ""
	mode = 0
	for c in string:
		if(c == '='):
			mode = 1
		elif(c == '&'):
			dic.update({key:value})
			mode = 0
			key = ""
			value = ""
		elif(mode == 0):
			key = key + c
		else:
			value = value + c
	dic.update({key:value})
	return dic

def main():
	run(Port)

def run(port):
	Handler = H
	server = HTTPServer(('0.0.0.0', port), Handler)

	print "Running Server at Port {}".format(Port)
	server.serve_forever()

if __name__ == "__main__":
    main()
