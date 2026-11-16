"""Educational logistic regression trained entirely on synthetic examples.
No packages or patient data required. Not suitable for clinical use.
"""
import random, math, json, pathlib
random.seed(42)
rows=[]
for _ in range(2500):
    n=random.randint(1,30)
    missed=random.randint(0,n)
    x=missed/n
    few=int(n<7)
    # Artificial target: whether the synthetic next dose is missed.
    p=min(.95,max(.03,.08+.72*x+.08*few))
    y=int(random.random()<p)
    rows.append((x,few,y))
w=[0.,0.,0.]
for _ in range(2000):
    grad=[0.,0.,0.]
    for x,f,y in rows:
        z=w[0]+w[1]*x+w[2]*f
        err=1/(1+math.exp(-z))-y
        for i,v in enumerate((1.,x,f)): grad[i]+=err*v/len(rows)
    for i in range(3): w[i]-=.5*grad[i]
model={'intercept':w[0],'miss_rate':w[1],'few_records':w[2], 'description':'Synthetic-data logistic regression; demonstration only, not clinically validated.'}
pathlib.Path(__file__).with_name('model.json').write_text(json.dumps(model,indent=2)+'\n')
print(model)
