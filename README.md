# CISC474-stocks4me
                    The stocks4me web application is the brainchild of
                    Noah Hodgson, Justin Hamilton, Himanshu Patel, Matt
                    Pangilinan, and Vraj Patel.


                    Going into this project we had a goal to create a simple, clean stock
                    application that allowed a user to plan out their portfolio in real time. The user would be able to
                    buy and sell shares of stocks. The user would be able to modify a chart that displayed stock
                    information. Also, the user would be fed a custom news feed that would feed them information about
                    the stocks in their portfolio, so they can keep up with the companies that they invest in. Currently
                    it uses the following API:


                    D3:
                    Build charts as svg files so we can display graph of our fed in data


                    Finnhub:
                    Checks current prices of stocks, and provides real-time updates using WebSockets.


                    Alpha Vantage:
                    Provides a history of a stock symbol, going back over 10 years. This is the data for the chart.


                    News API:
                    Returns JSON object with all necessary information such as author, title, description, url, image,
                    and date published
